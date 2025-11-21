import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { CommunityItem } from "@/lib/models";
import { auth } from "@/lib/auth";

// --- RANDOM DUMMY DATA ---
const DUMMY_DATA = [
  {
    name: "Sourdough Starter",
    donor: "Baker Sarah",
    distance: "0.4 km",
    category: "General",
    quantity: 1,
    unit: "jar",
    image: "https://images.unsplash.com/photo-1585849834654-e1b9b2754637?auto=format&fit=crop&q=80&w=300",
    postedAt: "2 hours ago",
    status: "AVAILABLE",
    isDummy: true,
    donorId: "dummy_user_1" 
  },
  {
    name: "Ripe Mangoes (Rajshahi)",
    donor: "Tanvir H.",
    distance: "0.8 km",
    category: "Fruit",
    quantity: 4,
    unit: "kg",
    image: "🥭",
    postedAt: "4 hours ago",
    status: "AVAILABLE",
    isDummy: true,
    donorId: "dummy_user_2"
  },
  {
    name: "Homemade Beef Curry",
    donor: "Ayesha's Kitchen",
    distance: "1.2 km",
    category: "Meat Protein",
    quantity: 3,
    unit: "servings",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=300",
    postedAt: "30 mins ago",
    status: "AVAILABLE",
    isDummy: true,
    donorId: "dummy_user_3"
  },
  {
    name: "Fresh Mint Leaves",
    donor: "Roof Garden",
    distance: "0.1 km",
    category: "Vegetable",
    quantity: 2,
    unit: "bunches",
    image: "🌿",
    postedAt: "1 day ago",
    status: "AVAILABLE",
    isDummy: true,
    donorId: "dummy_user_4"
  },
  {
    name: "Canned Tuna",
    donor: "John D.",
    distance: "2.5 km",
    category: "Canned",
    quantity: 5,
    unit: "cans",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&q=80&w=300",
    postedAt: "5 hours ago",
    status: "AVAILABLE",
    isDummy: true,
    donorId: "dummy_user_5"
  },
  {
    name: "Leftover Biryani",
    donor: "Community Center",
    distance: "3.0 km",
    category: "Meat Protein",
    quantity: 10,
    unit: "packets",
    image: "🍛",
    postedAt: "Just now",
    status: "AVAILABLE",
    isDummy: true,
    donorId: "dummy_user_6"
  }
];

export async function GET() {
  await dbConnect();

  try {
    // 1. Fetch Real Items from DB
    const realItems = await CommunityItem.find({ status: "AVAILABLE" }).sort({ createdAt: -1 });

    const formattedRealItems = realItems.map((item) => {
        const diff = Date.now() - new Date(item.createdAt).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const timeString = hours < 1 ? "Just now" : `${hours} hours ago`;

        return {
            id: item._id.toString(),
            name: item.name,
            donor: item.donor,
            donorId: item.donorId, // <--- CRITICAL UPDATE: Returning ID to check ownership
            distance: item.distance,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            image: item.image,
            postedAt: timeString,
            status: item.status
        };
    });

    // 2. Format Dummy Data with IDs
    const formattedDummyItems = DUMMY_DATA.map((item, i) => ({
        id: `dummy_${i}`,
        ...item
    }));

    // 3. Combine: Real items first, then dummy data
    const combinedItems = [...formattedRealItems, ...formattedDummyItems];

    return NextResponse.json(combinedItems);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await req.json();
    
    const newItem = await CommunityItem.create({
        name: body.name,
        donor: body.donor,
        donorId: (session.user as any).id,
        distance: body.distance || "0.1 km",
        category: body.category,
        quantity: body.quantity,
        unit: body.unit,
        image: body.image,
        status: "AVAILABLE"
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error("Community Post Error:", error);
    return NextResponse.json({ error: "Failed to post item" }, { status: 500 });
  }
}