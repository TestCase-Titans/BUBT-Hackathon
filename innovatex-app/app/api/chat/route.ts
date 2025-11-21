import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/db";
import { Inventory, Resource } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  // 1. Authenticate
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key Missing" }, { status: 500 });

  try {
    await dbConnect();
    // FIX 1: Destructure 'mode' from the request body
    const { message, history, mode } = await req.json();
    const userId = (session.user as any).id;

    // 2. RETRIEVAL: Fetch Inventory (User Context) & Resources (Knowledge Base)
    const [inventoryItems, resources] = await Promise.all([
      Inventory.find({ userId, status: "ACTIVE", quantity: { $gt: 0 } }),
      Resource.find({}) 
    ]);

    // 3. Format Context Data
    const pantryList = inventoryItems.map(i => 
      `- ${i.name} (${i.quantity} ${i.unit}, expires in roughly ${Math.ceil((new Date(i.expirationDate).getTime() - Date.now())/(1000*60*60*24))} days)`
    ).join("\n");

    const knowledgeBase = resources.map(r => 
      `- Tip (${r.category}): ${r.title} - ${r.description || r.url}`
    ).slice(0, 10).join("\n"); 

    // 4. Construct the "NourishBot" Persona
    const systemPrompt = `
      You are NourishBot, an expert eco-conscious kitchen assistant. 
      
      YOUR CAPABILITIES:
      1. Food Waste Reduction: Prioritize using items expiring soon.
      2. Nutrition Balancing: Suggest balanced meals (Protein, Veg, Carbs).
      3. Budget Meal Planning: Suggest low-cost ideas using existing inventory.
      4. Leftover Transformation: Creative ideas to reuse cooked food.
      5. Local Food Sharing: If user has too much, suggest donating to local food banks or neighbors.
      6. Environmental Impact: Explain *why* saving this food helps the planet (CO2, water usage).

      USER'S CURRENT PANTRY (Context):
      ${pantryList || "Pantry is empty."}

      KNOWLEDGE BASE (Tips & Local Info):
      ${knowledgeBase}

      INSTRUCTIONS:
      - Answer the user's question using their pantry items whenever possible.
      - Be friendly, encouraging, and professional.
      - Format output with Markdown (bolding, bullet points).
      - If they ask about sharing, mention local community fridges or apps like Olio based on general knowledge.
    `;

    // 5. Call Gemini with History (Contextual Memory)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // FIX 2: Increase token limit if mode is 'guide'
    // 'guide' mode is sent from the resources page (approx 2000 tokens for articles)
    // Default chat mode keeps 500 tokens for faster, shorter replies
    const maxTokens = mode === 'guide' ? 2000 : 500;

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I am NourishBot, ready to help with your pantry and sustainability goals." }] },
        ...chatHistory
      ],
      generationConfig: {
        maxOutputTokens: maxTokens, // <--- Updated variable here
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}