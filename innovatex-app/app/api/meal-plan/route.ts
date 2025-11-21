import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/db";
import { User, Inventory, ActionLog } from "@/lib/models";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key Missing" }, { status: 500 });
  }

  await dbConnect();

  try {
    const userId = (session.user as any).id;
    
    // 1. Fetch User Data
    const user = await User.findById(userId);
    const location = user.location || "Dhaka, Bangladesh"; 

    // 2. Inventory
    const inventory = await Inventory.find({ userId, status: "ACTIVE", quantity: { $gt: 0 } });
    const inventoryList = inventory.map((item) => {
        const now = new Date();
        const expiry = new Date(item.expirationDate);
        const diffTime = expiry.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${item.name} (${item.quantity} ${item.unit}, Expires in ${daysLeft} days)`;
    }).join(", ");

    // 3. History Analysis (Habits)
    const historyLogs = await ActionLog.find({ userId }).sort({ createdAt: -1 }).limit(50);
    const consumedMap = new Map();
    const wastedSet = new Set();
    historyLogs.forEach((log: any) => {
        if (log.actionType === "CONSUME") consumedMap.set(log.itemName, (consumedMap.get(log.itemName) || 0) + 1);
        else if (log.actionType === "WASTE") wastedSet.add(log.itemName);
    });
    const favorites = Array.from(consumedMap.entries()).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5).map(e => e[0]).join(", ");
    
    // 4. Context Strings
    const preferences = `
      Diet: ${user.dietaryPreferences?.join(", ") || "General"};
      Household Size: ${user.householdSize || 1};
      Budget: ${user.budgetRange || "Medium"};
      Location: ${location};
    `;

    // --- NEW: Dummy Nutrient Rules ---
    const nutritionRules = `
      **Nutritional Constraints (Dummy Rules):**
      - Each Lunch/Dinner MUST contain at least one Protein source (Dal, Egg, Fish, Meat).
      - Daily plan must include at least one Vegetable item.
      - If budget is 'Low', prioritize plant-based proteins (Lentils/Beans) over meat.
    `;

    // 5. Prompt Construction
    const prompt = `
      Act as an expert chef and sustainability consultant specialized in Bangladeshi cuisine. 
      Create a 7-day meal plan optimizing for: 1) Waste Reduction, 2) Budget, 3) Nutrition.
      
      **User Profile:**
      ${preferences}
      
      **User Habits:**
      - Favorites: ${favorites || "None"}
      - Wasted Often: ${Array.from(wastedSet).join(", ") || "None"} (Avoid these or use in very simple recipes)
      
      **Available Inventory (MUST USE EXPIRING ITEMS FIRST):**
      ${inventoryList}
      
      ${nutritionRules}
      
      **Guidelines:**
      1. **Cuisine:** Bangladeshi style (Bhorta, Bhaji, Dal, Curry).
      2. **Cost Alternatives:** If a recipe usually calls for an expensive ingredient (e.g. Beef), suggest a cheaper local alternative (e.g. Egg/Broiler Chicken) if the user's budget is 'Low' or 'Medium'.
      3. **Currency:** BDT (৳).
      
      **Output Requirement (JSON Only):**
      {
        "analysis": {
          "wasteSaved": "Detailed list of inventory items used.",
          "budgetScore": "Low/Medium/High",
          "habitNote": "Note on how habits/nutrition rules influenced the plan.",
          "alternativesSuggested": "List any cost-saving swaps made (e.g. 'Swapped Beef for Eggs')."
        },
        "plan": [
          { "day": "Monday", "meals": { "breakfast": "...", "lunch": "...", "dinner": "..." } },
          ... (7 days)
        ],
        "shoppingList": [
          { "item": "...", "estimatedCost": 0 }
        ]
      }
    `;

    // 6. AI Generation
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(text);

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("Meal Plan Error:", error);
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}