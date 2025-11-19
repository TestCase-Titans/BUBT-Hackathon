import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Inventory } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const { id } = await params;

  await Inventory.findOneAndDelete({ 
    _id: id, 
    userId: (session.user as any).id 
  });

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
  const body = await request.json();

  const updatedItem = await Inventory.findOneAndUpdate(
    { _id: id, userId: (session.user as any).id },
    { $set: body },
    { new: true }
  );

  return NextResponse.json(updatedItem);
}