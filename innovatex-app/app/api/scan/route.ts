import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  console.log("--- API Scan Request Started ---");

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: "API Key Missing" }, { status: 200 });
  }

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) return NextResponse.json({ success: false, error: "No Image URL" }, { status: 200 });

 
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error(`Failed to fetch image: ${imageResp.status}`);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `Analyze this food receipt or item. Return valid JSON only.
    Fields: name (string), category (string), quantity (number), unit (string), expiryDays (number), cost (number).
    Categories: Meat Protein, Fish Protein, Dairy Protein, Vegetable Protein, Vegetable, Fruit, Grain, Dairy, Spices, Fats, Snack, General.
    If the cost is not visible, estimate a market price in BDT.
    NO Markdown. Return a single object, not an array.`;


    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const response = await result.response;
    let text = response.text();
    console.log("AI Response Raw:", text);

   
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    let data = JSON.parse(text);


    if (Array.isArray(data)) {
        data = data[0];
    }

    console.log("Processed Data:", data);

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