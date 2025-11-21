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
      // FIX: Send these fields separately!
      description: resource.description || "",
      url: resource.url || "",
      // Keep content for backward compatibility, but prioritize description
      content: resource.description || "" 
    }));

    return NextResponse.json(formattedResources);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching resources" },
      { status: 500 }
    );
  }
}