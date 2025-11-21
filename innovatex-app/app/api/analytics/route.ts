import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ActionLog, User } from "@/lib/models";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

const CALORIE_ESTIMATES: Record<string, number> = {
  Grain: 3500, Vegetable: 400, Fruit: 500, "Meat Protein": 2000,
  "Fish Protein": 1500, "Dairy Protein": 150, Dairy: 700, Fats: 8800,
  Snack: 500, Beverage: 400, Spices: 0, General: 200,
};

const THRESHOLDS: Record<string, { min?: number; max?: number }> = {
  Grain: { max: 1200 }, Vegetable: { min: 200 }, Fruit: { min: 100 },
  "Meat Protein": { max: 800 }, Snack: { max: 250 }, Fats: { max: 400 },
};

export async function GET() {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const userId = new mongoose.Types.ObjectId((session.user as any).id);
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    // [MODIFIED] Use .lean() to get impactScore (which might be outside schema)
    const userProfile: any = await User.findById(userId).lean();
    const householdSize = userProfile?.householdSize || 1;
    const location = userProfile?.location || "Urban Region"; 
    const userImpactScore = userProfile?.impactScore || 0; // Fetch User's Score

    // --- 1. Setup 30-Day Timeline (Consumption + Waste) ---
    const timelineStats: Record<string, any> = {};
    const wasteTrend: { date: string; cost: number; grams: number }[] = [];

    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        
        timelineStats[dateKey] = { 
          date: dateKey,
          name: d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) 
        };
        
        wasteTrend.push({ date: dateKey, cost: 0, grams: 0 });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // --- 2. Fetch Logs ---
    const logs = await ActionLog.find({
      userId: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    const categoryTotalCalories: Record<string, number> = {};
    let totalCaloriesConsumed = 0;
    let totalWasteCost = 0;
    let totalWasteGrams = 0;
    let consumptionCount = 0;
    let wasteCount = 0;

    logs.forEach((log) => {
      const dateKey = new Date(log.createdAt).toISOString().split('T')[0];
      if (!timelineStats[dateKey]) return;

      const qty = log.quantityChanged || 1;
      const isWeight = log.unit === "g" || log.unit === "ml";
      const normalizedQty = isWeight ? qty / 1000 : qty; 
      const grams = isWeight ? qty : qty * 100; 

      if (log.actionType === "CONSUME") {
        consumptionCount++;
        const cat = Array.isArray(log.category) ? log.category[0] : log.category;
        const factor = CALORIE_ESTIMATES[cat] || 200;
        const calPerPerson = Math.round((normalizedQty * factor) / householdSize);

        timelineStats[dateKey][cat] = (timelineStats[dateKey][cat] || 0) + calPerPerson;
        categoryTotalCalories[cat] = (categoryTotalCalories[cat] || 0) + calPerPerson;
        totalCaloriesConsumed += calPerPerson;
      } else if (log.actionType === "WASTE") {
        wasteCount++;
        const cost = log.cost || 0; 
        
        totalWasteCost += cost;
        totalWasteGrams += grams;

        const dayEntry = wasteTrend.find(w => w.date === dateKey);
        if (dayEntry) {
          dayEntry.cost += cost;
          dayEntry.grams += grams;
        }
      }
    });

    // --- 3. Metrics Calculation ---
    const chartData = Object.values(timelineStats);

    let topCategory = { name: "N/A", percentage: 0 };
    const sortedCats = Object.entries(categoryTotalCalories).sort((a, b) => b[1] - a[1]); 
    if (sortedCats.length > 0 && totalCaloriesConsumed > 0) {
      topCategory = { 
        name: sortedCats[0][0], 
        percentage: Math.round((sortedCats[0][1] / totalCaloriesConsumed) * 100) 
      };
    }

    const totalActions = consumptionCount + wasteCount;
    const goalProgress = totalActions === 0 ? 0 : Math.round((consumptionCount / totalActions) * 100);

    const imbalanceReport: any[] = [];
    Object.entries(categoryTotalCalories).forEach(([cat, total]) => {
      const dailyAvg = total / 30;
      if (THRESHOLDS[cat]?.max && dailyAvg > THRESHOLDS[cat].max!) {
        imbalanceReport.push({ category: cat, status: "OVER", diff: Math.round(dailyAvg - THRESHOLDS[cat].max!) });
      } else if (THRESHOLDS[cat]?.min && dailyAvg < THRESHOLDS[cat].min!) {
        imbalanceReport.push({ category: cat, status: "UNDER", diff: Math.round(THRESHOLDS[cat].min! - dailyAvg) });
      }
    });

    // --- 4. COMMUNITY SCORE CALCULATION (New) ---
    // Calculate real community average from all users
    const scoreStats = await User.aggregate([
      { 
        $group: { 
          _id: null, 
          avgScore: { $avg: "$impactScore" } 
        } 
      }
    ]);
    
    const communityAvgScore = Math.round(scoreStats[0]?.avgScore || 50); // Default to 50 if no data
    const scoreDiff = userImpactScore - communityAvgScore;
    
    // Classification based on SDG Score
    // If User Score >= Avg, it's "Good" (High Impact is Good)
    const communityStatus = scoreDiff >= 0 ? "Good" : "Concern";

    // --- 5. AI WASTE PREDICTION ---
    let aiForecast = {
      projectedCost: Math.round(totalWasteCost),
      communityAvgCost: communityAvgScore, // [MODIFIED] Sending Score instead of Cost
      userScore: userImpactScore,          // [NEW] Sending User Score
      status: communityStatus,             // [MODIFIED] Status based on Score
      analysis: "Insufficient data for prediction."
    };

    let advice = "Log more meals to enable smart insights.";

    if (apiKey && (totalWasteCost > 0 || totalCaloriesConsumed > 0)) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const trendString = wasteTrend.map(w => w.cost).join(",");

        const prompt = `
          Act as a data scientist.
          Context: Household of ${householdSize} in ${location}.
          
          Input Data:
          1. Last 30 Days Waste Cost (Daily Array): [${trendString}]
          2. Total Waste: ${totalWasteCost} BDT
          3. Diet: Top Source ${topCategory.name}

          Tasks:
          1. Predict next 30 days waste cost (BDT).
          2. Provide ONE short, encouraging health/sustainability tip (max 15 words).
          3. One short "Pattern Analysis" sentence (e.g. "Waste spikes on weekends").

          Output JSON ONLY:
          { "predictedCost": number, "advice": "string", "pattern": "string" }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(text);

        aiForecast = {
          ...aiForecast, // Keep score data
          projectedCost: data.predictedCost,
          analysis: data.pattern
        };
        advice = data.advice;

      } catch (e) {
        console.error("AI Prediction Error", e);
        aiForecast.projectedCost = Math.round(totalWasteCost * 1.1);
      }
    }

    return NextResponse.json({ 
      chartData, 
      prediction: advice,
      metrics: { topCategory, goalProgress }, 
      imbalances: imbalanceReport,
      wasteForecast: aiForecast 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}