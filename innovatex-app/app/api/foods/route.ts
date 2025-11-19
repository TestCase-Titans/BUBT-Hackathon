import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { FoodItem } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const foods = await FoodItem.find({});
    
    const formattedFoods = foods.map(item => ({
      id: item._id,
      name: item.name,
      category: item.category,
      typicalExpiryDays: item.typicalExpiryDays,
      costPerUnit: item.costPerUnit,
      unit: item.unit,
      image: item.imageUrl || "📦" 
    }));

    return NextResponse.json(formattedFoods);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch food database" }, { status: 500 });
  }
}