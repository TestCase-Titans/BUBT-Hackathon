import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "API Key Missing" }, { status: 200 });
  }

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ success: false, error: "No Image URL" }, { status: 200 });

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash as confirmed working for you
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error(`Failed to fetch image: ${imageResp.status}`);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // UPDATED PROMPT: Ask for an ARRAY of items
    const prompt = `Analyze this receipt or food image. Identify ALL food items listed.
    Return a JSON ARRAY of objects. Each object must have:
    - name (string)
    - category (string, choose from: Meat Protein, Fish Protein, Dairy Protein, Vegetable Protein, Vegetable, Fruit, Grain, Dairy, Spices, Fats, Snack, General)
    - quantity (number, extract from receipt if available, else 1)
    - unit (string, default to 'pcs' or 'kg')
    - expiryDays (number, estimate based on food type)
    - cost (number, extract unit price or total price. If not visible, estimate market price in BDT)
    
    Output strictly JSON array. No Markdown.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Clean & Parse
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let data = JSON.parse(text);

    // Ensure it is always an array
    if (!Array.isArray(data)) {
        data = [data];
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("GEMINI ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Scan Failed",
      details: JSON.stringify(error)
    }, { status: 200 });
  }
}