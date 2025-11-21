import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ActionLog, User } from "@/lib/models";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

// Estimated Calories per Unit (e.g., kg, L, or pack)
const CALORIE_ESTIMATES: Record<string, number> = {
  Grain: 3500, Vegetable: 400, Fruit: 500, "Meat Protein": 2000,
  "Fish Protein": 1500, "Dairy Protein": 150, Dairy: 700, Fats: 8800,
  Snack: 500, Beverage: 400, Spices: 0, General: 200,
};

// Daily Calorie Thresholds
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
    const userProfile = await User.findById(userId);
    const householdSize = userProfile?.householdSize || 1;

    // Fetch Logs (Last 30 Days)
    const rawConsumption = await ActionLog.aggregate([
      { $match: { userId: userId, actionType: "CONSUME", createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $unwind: "$category" },
      { $project: { dayOfWeek: { $dayOfWeek: "$createdAt" }, category: 1, quantityChanged: 1, unit: 1 } },
    ]);

    const processedStats: Record<string, any> = {};
    const categoryTotalCalories: Record<string, number> = {};
    let totalCaloriesConsumed = 0;

    rawConsumption.forEach((log) => {
      const cat = log.category;
      const factor = CALORIE_ESTIMATES[cat] || 200;
      const normalizedQty = log.unit === "g" || log.unit === "ml" ? (log.quantityChanged || 1) / 1000 : (log.quantityChanged || 1);
      const calPerPerson = Math.round((normalizedQty * factor) / householdSize);

      // Chart Data Construction
      const key = `${log.dayOfWeek}-${cat}`;
      processedStats[key] = (processedStats[key] || 0) + calPerPerson;

      // Totals for Pie Chart
      categoryTotalCalories[cat] = (categoryTotalCalories[cat] || 0) + calPerPerson;
      totalCaloriesConsumed += calPerPerson;
    });

    // --- NEW: Prepare Pie Chart Data ---
    const categoryBreakdown = Object.entries(categoryTotalCalories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort big to small

    // Bar Chart Data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const chartData = days.map((day, index) => {
      const dataPoint: any = { name: day };
      Object.keys(processedStats).forEach((key) => {
        if (parseInt(key.split("-")[0]) === index + 1) dataPoint[key.split("-")[1]] = processedStats[key];
      });
      return dataPoint;
    });

    // Metrics Calculation
    let topCategory = { name: "N/A", percentage: 0 };
    const maxEntry = categoryBreakdown[0];
    if (maxEntry && totalCaloriesConsumed > 0) {
      topCategory = { name: maxEntry.name, percentage: Math.round((maxEntry.value / totalCaloriesConsumed) * 100) };
    }

    // Waste Stats for Goal Progress
    const wasteStats = await ActionLog.aggregate([
      { $match: { userId: userId, actionType: "WASTE", createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const goalProgress = (rawConsumption.length + (wasteStats[0]?.count || 0)) === 0 ? 0 : Math.round((rawConsumption.length / (rawConsumption.length + (wasteStats[0]?.count || 0))) * 100);

    // Imbalance Report
    const imbalanceReport: any[] = [];
    Object.entries(categoryTotalCalories).forEach(([cat, total]) => {
      const avg = total / 30;
      if (THRESHOLDS[cat]?.max && avg > THRESHOLDS[cat].max!) imbalanceReport.push({ category: cat, status: "OVER", diff: Math.round(avg - THRESHOLDS[cat].max!) });
      else if (THRESHOLDS[cat]?.min && avg < THRESHOLDS[cat].min!) imbalanceReport.push({ category: cat, status: "UNDER", diff: Math.round(THRESHOLDS[cat].min! - avg) });
    });

    // AI Prediction
    let prediction = "Log more meals to enable smart insights.";
    if (totalCaloriesConsumed > 0 && apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Based on: Top Source ${topCategory.name}, Imbalances: ${imbalanceReport.map(i => i.category).join(', ') || 'None'}. Give ONE short advice (max 15 words).`;
      const result = await model.generateContent(prompt);
      prediction = result.response.text().replace(/\*/g, "").trim();
    }

    return NextResponse.json({ chartData, categoryBreakdown, prediction, metrics: { topCategory, goalProgress }, imbalances: imbalanceReport });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to analyze" }, { status: 500 });
  }
}