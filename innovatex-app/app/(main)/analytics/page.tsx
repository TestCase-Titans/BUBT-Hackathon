"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  TrendingUp, 
  Target, 
  TrendingDown, 
  Users, 
  AlertTriangle,
  Wallet
} from "lucide-react";
import ConsumptionChart from "@/components/ConsumptionChart"; //
import WeeklyPieChart from "@/components/WeeklyPieChart"; //
import PageWrapper from "@/components/PageWrapper"; //

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const metrics = analyticsData?.metrics || {
    topCategory: { name: "None", percentage: 0 },
    goalProgress: 0,
  };

  const forecast = analyticsData?.wasteForecast || {
    projectedCost: 0,
    communityAvgCost: 0,
    status: "Good",
    analysis: "Gathering data..."
  };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-2">
            Analytics
          </h2>
          <p className="text-gray-500 lg:text-lg flex items-center gap-2">
            <Activity size={18} className="text-[#D4FF47]" />
            AI-Powered Consumption & Waste Tracking
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- 1. Main Consumption Chart --- */}
          <div className="lg:col-span-2">
             <ConsumptionChart preloadedData={analyticsData} />
          </div>

          {/* --- 2. Weekly Diet Breakdown --- */}
          <div className="lg:col-span-1 h-[450px] lg:h-auto">
             <WeeklyPieChart chartData={analyticsData?.chartData} />
          </div>

          {/* --- 3. Forecast & Impact Section --- */}
          <div className="lg:col-span-3">
            <h3 className="text-xl font-bold text-[#0A3323] mb-4 flex items-center gap-2">
              <Wallet className="text-[#0A3323]" size={20} /> 
              Waste Projection (AI Model)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card A: Predicted Loss */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <TrendingDown size={100} />
                </div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-bold mb-2">
                  Projected Loss (30d)
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-[#0A3323]">
                    {loading ? "..." : `৳${forecast.projectedCost}`}
                  </span>
                  <span className="text-xs text-gray-400">BDT</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 italic">
                  "{loading ? "Analyzing..." : forecast.analysis}"
                </p>
              </div>

              {/* Card B: Community Comparison (FIXED TERMINOLOGY) */}
              <div className={`p-6 rounded-3xl border shadow-sm ${forecast.status === "Good" ? "bg-[#E8F5E9] border-green-100" : "bg-[#FFF8E1] border-yellow-200"}`}>
                <p className={`text-sm uppercase tracking-wider font-bold mb-2 flex items-center gap-2 ${forecast.status === "Good" ? "text-green-800" : "text-yellow-800"}`}>
                  <Users size={16} /> Community Comparison
                </p>
                
                {loading ? (
                  <p className="text-sm text-gray-500">Comparing...</p>
                ) : (
                  <>
                    <div className="flex items-end gap-2">
                      {/* Changed "Higher" to "Above Avg" and "Better" to "Below Avg" to be unambiguous */}
                      <span className={`text-3xl font-serif font-bold ${forecast.status === "Good" ? "text-green-900" : "text-yellow-900"}`}>
                        {forecast.status === "Good" ? "Below Avg" : "Above Avg"}
                      </span>
                    </div>
                    <p className={`text-xs mt-2 ${forecast.status === "Good" ? "text-green-700" : "text-yellow-700"}`}>
                       Avg. neighbor wastes <strong>৳{forecast.communityAvgCost}</strong>. 
                       {forecast.status === "Good" ? " You are saving money!" : " Try to reduce waste."}
                    </p>
                  </>
                )}
              </div>

               {/* Card C: Efficiency Score */}
               <div className="bg-[#F3F6F4] p-6 rounded-3xl border border-[#0A3323]/10">
                <p className="text-sm text-[#0A3323] uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                  <Target size={16} /> Efficiency Score
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-[#0A3323]">
                    {loading ? "..." : metrics.goalProgress}%
                  </span>
                </div>
                {!loading && (
                  <div className="w-full bg-[#0A3323]/10 rounded-full h-2 mt-4">
                    <div 
                      className="bg-[#0A3323] h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${metrics.goalProgress}%` }} 
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                   Items consumed vs. total logs.
                </p>
              </div>

            </div>
          </div>

          {/* --- 4. Top Category --- */}
          <div className="lg:col-span-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm text-[#0A3323]">
                  <TrendingUp size={20} />
                </div>
                <div>
                   <p className="text-xs text-gray-500 font-bold uppercase">Primary Calorie Source</p>
                   <p className="text-[#0A3323] font-medium">
                      {loading ? "..." : metrics.topCategory.name} ({loading ? "0" : metrics.topCategory.percentage}%)
                   </p>
                </div>
             </div>
             {forecast.status !== "Good" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                   <AlertTriangle size={12} /> High Waste Detected
                </div>
             )}
          </div>

        </div>
      </div>
    </PageWrapper>
  );
}