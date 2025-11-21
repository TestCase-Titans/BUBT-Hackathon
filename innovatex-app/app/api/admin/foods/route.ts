import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { FoodItem } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  
  // 1. Security: Check if user is SuperAdmin
  if (!(session?.user as any)?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    const { name, category, typicalExpiryDays, costPerUnit, unit, imageUrl } = body;

    // 2. Validation
    if (!name || !category || !costPerUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Check for duplicates
    const existing = await FoodItem.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existing) {
      return NextResponse.json({ error: "Food item already exists!" }, { status: 409 });
    }

    // 4. Create new Item
    // Note: category comes as a comma-separated string from the UI, we split it here
    const categoryArray = Array.isArray(category) ? category : category.split(",").map((c: string) => c.trim());

    const newItem = await FoodItem.create({
      name,
      category: categoryArray,
      typicalExpiryDays: Number(typicalExpiryDays) || 7,
      costPerUnit: Number(costPerUnit),
      unit: unit || "kg",
      imageUrl: imageUrl || "📦", // Default emoji if none provided
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Add Food Error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}