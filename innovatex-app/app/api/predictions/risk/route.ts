import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/db";
import { Inventory, User } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key Missing" }, { status: 500 });

  await dbConnect();
  const userId = (session.user as any).id;

  try {
    // 1. Fetch User Context (Location) & Calculate Season
    const user = await User.findById(userId);
    const location = user?.location || "Unknown";
    
    const month = new Date().getMonth(); // 0-11
    // Simple Season Logic (North Hemisphere default)
    // Summer: June (5) to Sept (8)
    const isSummer = month >= 5 && month <= 8; 
    const seasonContext = isSummer ? "Summer (High Heat/Humidity)" : "Cooler/Winter";

    // 2. Fetch Items needing analysis
    // Criteria: Active, Has Quantity, AND (Not checked in 24h OR No score yet)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const itemsToAnalyze = await Inventory.find({
      userId,
      status: "ACTIVE",
      quantity: { $gt: 0 },
      $or: [
        { lastRiskAnalysis: { $lt: oneDayAgo } },
        { riskScore: { $exists: false } }
      ]
    }).limit(20); // Batch limit to prevent huge prompts and timeouts

    if (itemsToAnalyze.length === 0) {
      return NextResponse.json({ message: "Risk scores up to date", updated: 0 });
    }

    // 3. Hybrid Logic: Separate 'Obvious' from 'Complex'
    const complexItems: any[] = [];
    const bulkUpdates: any[] = [];
    const today = new Date();

    itemsToAnalyze.forEach((item: any) => {
      const expiry = new Date(item.expirationDate);
      const diffTime = expiry.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // RULE 1: Already Expired or Critical (< 2 days)
      if (daysLeft <= 2) {
         bulkUpdates.push({
           updateOne: {
             filter: { _id: item._id },
             update: { $set: { 
                 riskScore: 95, 
                 riskLabel: "Critical", 
                 riskFactor: daysLeft < 0 ? "Expired" : "Expiring Soon", 
                 lastRiskAnalysis: new Date() 
             }}
           }
         });
      } 
      // RULE 2: Safe (> 14 days)
      else if (daysLeft > 14) {
        bulkUpdates.push({
           updateOne: {
             filter: { _id: item._id },
             update: { $set: { 
                 riskScore: 10, 
                 riskLabel: "Safe", 
                 riskFactor: "Long Shelf Life", 
                 lastRiskAnalysis: new Date() 
             }}
           }
         });
      }
      // RULE 3: The "Grey Zone" (3-14 days) -> Send to AI
      else {
        complexItems.push({ 
            id: item._id, 
            name: item.name, 
            category: item.category, 
            daysLeft,
            quantity: item.quantity,
            unit: item.unit
        });
      }
    });

    // 4. AI Analysis for "Grey Zone" Items
    if (complexItems.length > 0) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        Act as a food safety expert. Analyze spoilage risk for these items in ${location} during ${seasonContext}.
        
        Items: ${JSON.stringify(complexItems)}

        Context:
        - High Heat/Humidity (${seasonContext}) drastically increases risk for Dairy, Berries, Leafy Greens, Fish.
        - Root vegetables, Canned goods, Spices are resilient.
        - If quantity is high (e.g. 5kg Milk) and days left are low, Risk is HIGHER (Consumption Velocity Risk).

        Return a JSON Object where keys are Item IDs and values are objects: 
        { "score": number (0-100), "label": "Safe/Low/Medium/High/Critical", "factor": "Short reason (max 4 words)" }.
        
        JSON ONLY. No markdown.
      `;

      const result = await model.generateContent(prompt);
      let responseText = result.response.text();
      
      // Clean code blocks if present
      responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      try {
          const aiResults = JSON.parse(responseText);

          // Merge AI results into bulk updates
          Object.keys(aiResults).forEach((id) => {
            const analysis = aiResults[id];
            if (analysis) {
                bulkUpdates.push({
                  updateOne: {
                    filter: { _id: id },
                    update: { $set: { 
                      riskScore: analysis.score || 50, 
                      riskLabel: analysis.label || "Medium", 
                      riskFactor: analysis.factor || "AI Analysis",
                      lastRiskAnalysis: new Date() 
                    }}
                  }
                });
            }
          });
      } catch (parseError) {
          console.error("Failed to parse AI risk analysis:", parseError);
          // Fallback for these items if AI fails
          complexItems.forEach(item => {
             bulkUpdates.push({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: { riskScore: 50, riskLabel: "Medium", riskFactor: "Manual Review", lastRiskAnalysis: new Date() } }
                }
             });
          });
      }
    }

    // 5. Execute Bulk Write
    if (bulkUpdates.length > 0) {
      await Inventory.bulkWrite(bulkUpdates);
    }

    return NextResponse.json({ success: true, updated: bulkUpdates.length });

  } catch (error) {
    console.error("Risk Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze risk" }, { status: 500 });
  }
}