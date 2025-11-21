import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = new mongoose.Types.ObjectId((session.user as any).id);

  try {
    // 1. Get Top 100
    const leaderboard = await User.find({}, "name image impactScore location")
      .sort({ impactScore: -1 })
      .limit(100)
      .lean();

    // 2. Get Current User Rank
    // Count how many users have a higher score than the current user
    const currentUser = await User.findById(userId, "impactScore");
    const currentScore = currentUser?.impactScore || 0;

    const rankCount = await User.countDocuments({
      impactScore: { $gt: currentScore },
    });
    const userRank = rankCount + 1;

    return NextResponse.json({
      leaderboard: leaderboard.map((u: any, i: number) => ({
        ...u,
        id: u._id, // Map _id to id
        rank: i + 1,
      })),
      userRank,
      userScore: currentScore,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
