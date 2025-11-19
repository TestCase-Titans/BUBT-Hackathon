import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Resource } from "@/lib/models";

export async function GET() {
  await dbConnect();
  try {
    const resources = await Resource.find({});

    const formattedResources = resources.map((resource) => ({
      id: resource._id.toString(),
      title: resource.title,
      category: resource.category,
      type: resource.type,
      content: resource.description || resource.url,
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching resources" },
      { status: 500 }
    );
  }
}
