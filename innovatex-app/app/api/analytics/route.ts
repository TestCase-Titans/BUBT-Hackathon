import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ActionLog } from "@/lib/models";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Hackathon Heuristic: Calorie estimates per unit (usually kg or L)
const CALORIE_ESTIMATES: Record<string, number> = {
  Grain: 3500, // ~350 kCal/100g -> 3500/kg
  Vegetable: 400, // Avg veg
  Fruit: 500, // Avg fruit
  "Meat Protein": 2000,
  "Fish Protein": 1500,
  "Dairy Protein": 150, // eggs (per unit/dozen approx normalized) or milk
  Dairy: 700,
  Fats: 8800, // Oil
  Snack: 500, // Per pack avg
  Beverage: 100,
  Spices: 0,
  General: 200,
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
    // 1. Fetch Raw Consumption Logs (We process calories in JS for flexibility)
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
      { $unwind: "$category" }, // Handle items with multiple categories
      {
        $project: {
          dayOfWeek: { $dayOfWeek: "$createdAt" }, // 1=Sun, 7=Sat
          category: 1,
          quantityChanged: 1, // Important: We need the amount, not just count
          unit: 1,
        },
      },
    ]);

    // 2. Process Data: Group by Day & Category -> Sum Calories
    const processedStats: Record<string, any> = {}; // Key: "DayIndex-Category"

    let totalCalories = 0;
    const categoryCalories: Record<string, number> = {};

    rawConsumption.forEach((log) => {
      const cat = log.category;
      const qty = log.quantityChanged || 1; // Default to 1 if missing

      // Calculate Calories
      const factor = CALORIE_ESTIMATES[cat] || 200; // Default fallback
      // Simple normalization: If unit is 'g' or 'ml', divide by 1000 (assuming estimates are per kg/L)
      const normalizedQty =
        log.unit === "g" || log.unit === "ml" ? qty / 1000 : qty;
      const calories = Math.round(normalizedQty * factor);

      // Aggregate for Chart
      const key = `${log.dayOfWeek}-${cat}`;
      if (!processedStats[key]) processedStats[key] = 0;
      processedStats[key] += calories;

      // Aggregate for Metrics
      categoryCalories[cat] = (categoryCalories[cat] || 0) + calories;
      totalCalories += calories;
    });

    // 3. Format Data for Recharts
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartData = days.map((day, index) => {
      const dayIndex = index + 1;
      const dataPoint: any = { name: day };

      // Find all categories for this day
      Object.keys(processedStats).forEach((key) => {
        const [d, c] = key.split("-");
        if (parseInt(d) === dayIndex) {
          dataPoint[c] = processedStats[key];
        }
      });
      return dataPoint;
    });

    // 4. Calculate Metrics (Top Category by Calories)
    let topCategory = { name: "N/A", percentage: 0 };
    let maxVal = 0;
    Object.entries(categoryCalories).forEach(([cat, cal]) => {
      if (cal > maxVal) {
        maxVal = cal;
        topCategory.name = cat;
      }
    });
    if (totalCalories > 0) {
      topCategory.percentage = Math.round((maxVal / totalCalories) * 100);
    }

    // 5. Goal Progress (Simple Consumption Rate based on Count is safer for waste)
    // (Keeping existing waste aggregation for the "Waste vs Eat" ratio as calories wasted is harder to verify)
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
    const totalWasteCount = wasteStats[0]?.count || 0;
    const totalConsumeCount = rawConsumption.length; // distinct actions
    const totalActions = totalConsumeCount + totalWasteCount;
    const goalProgress =
      totalActions === 0
        ? 0
        : Math.round((totalConsumeCount / totalActions) * 100);

    // 6. AI Prediction (Updated Context)
    let prediction = "Log meals to get calorie insights.";
    if (totalCalories > 0) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        User Nutrition Data (30 Days):
        - Total Calories Consumed: ${totalCalories}
        - Top Source: ${topCategory.name}
        - Waste Events: ${totalWasteCount}
        Task: Give 1 health/sustainability tip based on this. Max 15 words.
      `;
      const result = await model.generateContent(prompt);
      prediction = result.response.text().replace(/\*/g, "").trim();
    }

    return NextResponse.json({
      chartData,
      prediction,
      metrics: { topCategory, goalProgress },
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}
