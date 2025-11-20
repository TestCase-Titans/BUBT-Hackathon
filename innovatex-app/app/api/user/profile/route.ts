import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const user = await User.findById((session.user as any).id).select("-password");
  
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const body = await request.json();
  
 
  const updateFields: any = {};

  if (body.householdSize !== undefined) updateFields.householdSize = body.householdSize;
  if (body.dietaryPreferences !== undefined) updateFields.dietaryPreferences = body.dietaryPreferences;
  if (body.budgetRange !== undefined) updateFields.budgetRange = body.budgetRange;
  if (body.location !== undefined) updateFields.location = body.location;

  if (body.image !== undefined) updateFields.image = body.image;

  const updatedUser = await User.findByIdAndUpdate(
    (session.user as any).id,
    {
      $set: updateFields
    },
    { new: true }
  ).select("-password");

  return NextResponse.json(updatedUser);
}