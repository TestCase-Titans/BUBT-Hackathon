import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Inventory } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const items = await Inventory.find({ userId: (session.user as any).id });

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

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  
  try {
    const body = await request.json();
    
    // Create item linked to the specific user
    const newItem = await Inventory.create({
      ...body,
      userId: (session.user as any).id,
      status: 'ACTIVE',
      source: 'MANUAL' 
    });
    
    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}