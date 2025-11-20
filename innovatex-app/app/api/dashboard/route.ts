import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ActionLog, Inventory } from "@/lib/models";
import { auth } from "@/lib/auth";

// Prevent caching to ensure instant updates
export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const userId = (session.user as any).id;

  try {
    const logs = await ActionLog.find({ userId })
      .sort({ createdAt: -1 })
      .populate("inventoryId"); 

    // --- 1. Calculate Streak ---
    const uniqueDates = Array.from(new Set(logs.map((log: any) => 
      new Date(log.createdAt).toISOString().split('T')[0]
    ))).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates.length > 0) {
       if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
           streak = 1;
           let currentDate = new Date(uniqueDates[0]);
           for (let i = 1; i < uniqueDates.length; i++) {
               const prevDate = new Date(uniqueDates[i]);
               const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
               if (diffDays === 1) { streak++; currentDate = prevDate; } 
               else { break; }
           }
       }
    }

    // --- 2. Calculate Financials & Waste Metrics ---
    let wasteSavedUnits = 0;
    let moneySavedTotal = 0;
    let moneyWastedTotal = 0;

    logs.forEach((log: any) => {
        // "Saved Wastage": Consumed near expiration
        if (log.actionType === 'CONSUME' && log.inventoryId && log.inventoryId.expirationDate) {
            const consumedDate = new Date(log.createdAt);
            const expiryDate = new Date(log.inventoryId.expirationDate);
            const riskThreshold = new Date(expiryDate);
            riskThreshold.setDate(expiryDate.getDate() - 1); 
            
            if (consumedDate >= riskThreshold) {
                 wasteSavedUnits += (log.quantityChanged || 0);
                 moneySavedTotal += (log.cost || 0);
            }
        }
        
        // "Money Wasted": Items marked as WASTE
        if (log.actionType === 'WASTE') {
            // Ensure we use the stored cost in the log
            moneyWastedTotal += (log.cost || 0);
        }
    });

    // --- 3. Pantry Value ---
    const activeInventory = await Inventory.find({ userId, status: 'ACTIVE' });
    const pantryValue = activeInventory.reduce((acc, item) => {
        return acc + ((item.costPerUnit || 0) * item.quantity);
    }, 0);

    // --- 4. Impact Score ---
    const consumedCount = logs.filter((l:any) => l.actionType === 'CONSUME').length;
    const wastedCount = logs.filter((l:any) => l.actionType === 'WASTE').length;
    
    let impactScore = 50 + (consumedCount * 2) - (wastedCount * 5);
    if (impactScore > 100) impactScore = 100;
    if (impactScore < 0) impactScore = 0;

    return NextResponse.json({
      streak,
      wasteSavedUnits: wasteSavedUnits.toFixed(1),
      moneySaved: Math.round(moneySavedTotal),
      impactScore,
      inventoryCount: activeInventory.length,
      moneyWasted: Math.round(moneyWastedTotal),
      pantryValue: Math.round(pantryValue)
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}