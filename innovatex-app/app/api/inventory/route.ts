import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Inventory } from "@/lib/models";

export async function GET() {
  await dbConnect();

  try {
    const items = await Inventory.find({});

    const formattedItems = items.map((item) => {
      const now = new Date();
      const expiry = new Date(item.expirationDate);
      const diffTime = expiry.getTime() - now.getTime();
      const expiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        id: item._id.toString(),
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        image: item.imageUrl || "📦",
        expiryDays: expiryDays,
        status: item.status,
      };
    });

    return NextResponse.json(formattedItems);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
