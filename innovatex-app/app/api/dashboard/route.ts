import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ActionLog, Inventory, User } from "@/lib/models";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key missing" }, { status: 500 });
  }

  await dbConnect();
  const userId = (session.user as any).id;

  try {
    const logs = await ActionLog.find({ userId })
      .sort({ createdAt: -1 })
      .populate("inventoryId");

    const recentLogs = logs.slice(0, 5).map((log) => ({
      id: log._id,
      action: log.actionType,
      item: log.itemName,
      date: log.createdAt,
      quantity: log.quantityChanged,
      unit: log.unit,
    }));

    // --- Streak Logic ---
    const uniqueDates = Array.from(
      new Set(
        logs.map(
          (log: any) => new Date(log.createdAt).toISOString().split("T")[0]
        )
      )
    ).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (
      uniqueDates.length > 0 &&
      (uniqueDates[0] === today || uniqueDates[0] === yesterday)
    ) {
      streak = 1;
      let currentDate = new Date(uniqueDates[0]);
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i]);
        const diffDays = Math.ceil(
          Math.abs(currentDate.getTime() - prevDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          streak++;
          currentDate = prevDate;
        } else {
          break;
        }
      }
    }

    // --- Financials ---
    let wasteSavedUnits = 0;
    let moneySavedTotal = 0;
    let moneyWastedTotal = 0;

    logs.forEach((log: any) => {
      if (log.actionType === "CONSUME" && log.inventoryId?.expirationDate) {
        const consumedDate = new Date(log.createdAt);
        const expiryDate = new Date(log.inventoryId.expirationDate);
        const riskThreshold = new Date(expiryDate);
        riskThreshold.setDate(expiryDate.getDate() - 1);
        if (consumedDate >= riskThreshold) {
          wasteSavedUnits += log.quantityChanged || 0;
          moneySavedTotal += log.cost || 0;
        }
      }
      if (log.actionType === "WASTE") {
        moneyWastedTotal += log.cost || 0;
      }
    });

    const activeInventory = await Inventory.find({ userId, status: "ACTIVE" });
    const pantryValue = activeInventory.reduce(
      (acc, item) => acc + (item.costPerUnit || 0) * item.quantity,
      0
    );

    // --- SDG Score Calculation ---
    const consumedCount = logs.filter(
      (l: any) => l.actionType === "CONSUME"
    ).length;
    const wastedCount = logs.filter(
      (l: any) => l.actionType === "WASTE"
    ).length;

    let impactScore = 50 + consumedCount * 2 - wastedCount * 5;
    if (impactScore > 100) impactScore = 100;
    if (impactScore < 0) impactScore = 0;

    // --- SAVE SCORE TO USER (For Leaderboard) ---
    await User.findByIdAndUpdate(userId, { impactScore });

    // --- AI Insight Generation ---
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      User Stats: Score ${impactScore}/100. Consumed: ${consumedCount}, Wasted: ${wastedCount}.
      Generate a short, motivating weekly insight with a specific goal to improve this score.
      Format: "Insight: [Observation]. Goal: [Action]."
      Max 20 words.
    `;

    let weeklyInsight = "Track more food to get insights.";
    try {
      const result = await model.generateContent(prompt);
      weeklyInsight = result.response.text().replace(/\*/g, "").trim();
    } catch (e) {
      console.error("AI Insight Error", e);
    }

    return NextResponse.json({
      streak,
      wasteSavedUnits: wasteSavedUnits.toFixed(1),
      moneySaved: Math.round(moneySavedTotal),
      impactScore,
      inventoryCount: activeInventory.length,
      moneyWasted: Math.round(moneyWastedTotal),
      pantryValue: Math.round(pantryValue),
      recentLogs,
      weeklyInsight, // <-- Sending this to frontend
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
