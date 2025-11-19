import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { FoodItem } from "@/lib/models";

export async function GET() {
  await dbConnect();
  try {
    const foods = await FoodItem.find({}).sort({ name: 1 });

    const formattedFoods = foods.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      typicalExpiryDays: item.typicalExpiryDays,
      costPerUnit: item.costPerUnit,
      unit: item.unit,
      image: item.imageUrl,
    }));

    return NextResponse.json(formattedFoods);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch food database" },
      { status: 500 }
    );
  }
}
