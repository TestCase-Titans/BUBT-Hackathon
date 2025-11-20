import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Inventory, ActionLog } from "@/lib/models";
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
        costPerUnit: item.costPerUnit, 
        expiryDays: expiryDays,
        expirationDate: item.expirationDate, 
        status: item.status,
      };
    });

    return NextResponse.json(formattedItems);
  } catch (error) {
    console.error("Inventory Fetch Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  
  try {
    const body = await request.json();
    const userId = (session.user as any).id;
    
    const newItem = await Inventory.create({
      userId: userId,
      name: body.name,
      category: body.category,
      quantity: body.quantity,
      unit: body.unit,
      expirationDate: body.expirationDate,
      costPerUnit: body.costPerUnit,
      imageUrl: body.imageUrl || body.image, 
      status: 'ACTIVE',
      source: 'MANUAL' 
    });

    await ActionLog.create({
      userId: userId,
      inventoryId: newItem._id,
      itemName: newItem.name,
      
      category: newItem.category,
      cost: (newItem.costPerUnit || 0) * newItem.quantity,
      
      actionType: "ADD",
      quantityChanged: newItem.quantity,
      unit: newItem.unit,
      reason: "Initial Add"
    });
    
    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Inventory Add Error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}