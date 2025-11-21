import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ActionLog, User } from "@/lib/models";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Estimated Calories per Unit (e.g., kg, L, or pack)
const CALORIE_ESTIMATES: Record<string, number> = {
  Grain: 3500, // ~350 kCal/100g -> 3500/kg (Rice/Flour)
  Vegetable: 400, // Avg mixed veggies
  Fruit: 500, // Avg fruit
  "Meat Protein": 2000, // Chicken/Beef avg
  "Fish Protein": 1500,
  "Dairy Protein": 150, // Per unit (egg?) or adjusted logic below
  Dairy: 700, // Milk/Curd
  Fats: 8800, // Oil
  Snack: 500, // Per pack
  Beverage: 400, // Sugary drinks
  Spices: 0,
  General: 200,
};

// Daily Calorie Thresholds (Per Person) for "Health Logic"
const THRESHOLDS: Record<string, { min?: number; max?: number }> = {
  Grain: { max: 1200 }, // Too much rice?
  Vegetable: { min: 200 }, // Eat your veggies!
  Fruit: { min: 100 },
  "Meat Protein": { max: 800 },
  Snack: { max: 250 }, // Limit junk
  Fats: { max: 400 },
};

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "API configuration error" },
      { status: 500 }
    );
  }

  await dbConnect();
  const userId = new mongoose.Types.ObjectId((session.user as any).id);

  try {
    // 1. Fetch User to get Household Size
    const userProfile = await User.findById(userId);
    const householdSize = userProfile?.householdSize || 1;

    // 2. Fetch Consumption Logs (Last 30 Days)
    const rawConsumption = await ActionLog.aggregate([
      {
        $match: {
          userId: userId,
          actionType: "CONSUME",
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" },
          category: 1,
          quantityChanged: 1,
          unit: 1,
        },
      },
    ]);

    // 3. Process Data: Calculate Calories & Averages
    const processedStats: Record<string, any> = {}; // Chart Data map
    const categoryTotalCalories: Record<string, number> = {}; // For analysis

    let totalCaloriesConsumed = 0;

    rawConsumption.forEach((log) => {
      const cat = log.category;
      const qty = log.quantityChanged || 1;

      // Normalization (Simple heuristic)
      const factor = CALORIE_ESTIMATES[cat] || 200;
      const normalizedQty =
        log.unit === "g" || log.unit === "ml" ? qty / 1000 : qty;

      const totalCal = Math.round(normalizedQty * factor);

      // --- KEY CHANGE: Average per Household Member ---
      const calPerPerson = Math.round(totalCal / householdSize);

      // Add to Chart Data (Day-Category bucket)
      const key = `${log.dayOfWeek}-${cat}`;
      if (!processedStats[key]) processedStats[key] = 0;
      processedStats[key] += calPerPerson;

      // Add to Totals
      categoryTotalCalories[cat] =
        (categoryTotalCalories[cat] || 0) + calPerPerson;
      totalCaloriesConsumed += calPerPerson;
    });

    // 4. Determine Over/Under Consumption
    const imbalanceReport: {
      category: string;
      status: "OVER" | "UNDER";
      diff: number;
    }[] = [];
    const dailyAvgTotal = totalCaloriesConsumed / 30; // Approx daily avg over the period

    Object.entries(categoryTotalCalories).forEach(([cat, totalMonthCal]) => {
      const dailyAvg = totalMonthCal / 30;
      const rules = THRESHOLDS[cat];

      if (rules) {
        if (rules.max && dailyAvg > rules.max) {
          imbalanceReport.push({
            category: cat,
            status: "OVER",
            diff: Math.round(dailyAvg - rules.max),
          });
        } else if (rules.min && dailyAvg < rules.min) {
          imbalanceReport.push({
            category: cat,
            status: "UNDER",
            diff: Math.round(rules.min - dailyAvg),
          });
        }
      }
    });

    // 5. Format Chart Data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartData = days.map((day, index) => {
      const dayIndex = index + 1;
      const dataPoint: any = { name: day };
      Object.keys(processedStats).forEach((key) => {
        const [d, c] = key.split("-");
        if (parseInt(d) === dayIndex) {
          dataPoint[c] = processedStats[key];
        }
      });
      return dataPoint;
    });

    // 6. Calculate Metrics for UI Cards
    let topCategory = { name: "N/A", percentage: 0 };
    let maxVal = 0;
    Object.entries(categoryTotalCalories).forEach(([cat, cal]) => {
      if (cal > maxVal) {
        maxVal = cal;
        topCategory.name = cat;
      }
    });
    if (totalCaloriesConsumed > 0) {
      topCategory.percentage = Math.round(
        (maxVal / totalCaloriesConsumed) * 100
      );
    }

    const wasteStats = await ActionLog.aggregate([
      {
        $match: {
          userId: userId,
          actionType: "WASTE",
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const goalProgress =
      rawConsumption.length + (wasteStats[0]?.count || 0) === 0
        ? 0
        : Math.round(
            (rawConsumption.length /
              (rawConsumption.length + (wasteStats[0]?.count || 0))) *
              100
          );

    // 7. AI Prediction (Targeted Recommendation)
    let prediction = "Log more meals to enable smart insights.";
    if (totalCaloriesConsumed > 0) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      // Construct a specific prompt based on the imbalance report
      const imbalanceText =
        imbalanceReport.length > 0
          ? imbalanceReport
              .map((i) => `${i.status} consumed ${i.category}`)
              .join(", ")
          : "Balanced diet";

      const prompt = `
        Analysis Data (Avg per person):
        - Total Daily Calories: ${Math.round(dailyAvgTotal)}
        - Top Source: ${topCategory.name}
        - Imbalances Detected: ${imbalanceText}
        
        Task: Give ONE specific, actionable suggestion to fix the imbalance. 
        Format: "Because you eat too much [X], try [Y]." or "Boost your [X] intake by [Action]."
        Max 15 words. No generic advice.
      `;

      const result = await model.generateContent(prompt);
      prediction = result.response.text().replace(/\*/g, "").trim();
    }

    return NextResponse.json({
      chartData,
      prediction,
      metrics: { topCategory, goalProgress },
      imbalances: imbalanceReport, // Pass this to UI
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
