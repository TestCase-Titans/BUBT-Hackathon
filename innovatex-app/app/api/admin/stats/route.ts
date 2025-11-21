import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User, FoodItem, ActionLog } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  
  // Security Check
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await dbConnect();

  try {
    // 1. Stats Counts
    const userCount = await User.countDocuments({});
    const foodCount = await FoodItem.countDocuments({});

    // 2. Popular Foods (Top 5 Consumed)
    const popularFoods = await ActionLog.aggregate([
      { $match: { actionType: "CONSUME" } },
      { $group: { _id: "$itemName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Recent Users
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email image createdAt");

    return NextResponse.json({
      stats: {
        totalUsers: userCount,
        totalFoods: foodCount,
      },
      popularFoods,
      recentUsers
    });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}