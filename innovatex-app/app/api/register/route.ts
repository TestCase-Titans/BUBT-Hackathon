import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { User } from "@/lib/models";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, password, householdSize, dietaryPreferences } = body;

    // 1. Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create User
    await User.create({
      name,
      email,
      password: hashedPassword,
      householdSize: householdSize || 1,
      dietaryPreferences: dietaryPreferences || [],
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Error registering user" }, { status: 500 });
  }
}