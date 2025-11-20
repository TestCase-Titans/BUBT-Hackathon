import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Inventory, ActionLog } from "@/lib/models"; // Import ActionLog
import { auth } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const userId = (session.user as any).id;

  const item = await Inventory.findOne({ _id: id, userId });

  if (item) {
    await ActionLog.create({
      userId,
      inventoryId: id,
      itemName: item.name,
      category: item.category,
      cost: (item.costPerUnit || 0) * item.quantity,
      actionType: "DELETE",
      quantityChanged: item.quantity,
      unit: item.unit,
      reason: "Accidental/Manual Delete"
    });

    await Inventory.deleteOne({ _id: id });
  }

  return NextResponse.json({ message: "Item deleted" });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { id } = await params;
  const userId = (session.user as any).id;
  const body = await request.json();

  const currentItem = await Inventory.findOne({ _id: id, userId });
  if (!currentItem) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  let updateData: any = {};
  let logActionType = "UPDATE";
  let logQuantity = 0;

  if (body.action === "CONSUME" || body.action === "WASTE") {
    const amountToRemove = Number(body.quantity) || 0;
    const newQuantity = currentItem.quantity - amountToRemove;

    logActionType = body.action;
    logQuantity = amountToRemove;

    if (newQuantity <= 0) {
      updateData = { 
        quantity: 0, 
        status: body.action === "WASTE" ? "WASTED" : "CONSUMED" 
      };
    } else {
      updateData = { quantity: newQuantity };
    }
  } else {
    updateData = { $set: body };
  }

  const updatedItem = await Inventory.findOneAndUpdate(
    { _id: id, userId },
    updateData.quantity !== undefined ? { $set: updateData } : updateData,
    { new: true }
  );

  if (logQuantity > 0) {
    await ActionLog.create({
      userId,
      inventoryId: id,
      itemName: currentItem.name,
      category: currentItem.category,
      cost: (currentItem.costPerUnit || 0) * logQuantity,
      actionType: logActionType,
      quantityChanged: logQuantity,
      unit: currentItem.unit,
      reason: body.reason || "Manual Update"
    });
  }

  return NextResponse.json(updatedItem);
}