"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Sparkles,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Check,
  CalendarDays,
  Loader2,
} from "lucide-react";

// Consistent Color Palette
const CATEGORY_COLORS: Record<string, string> = {
  Vegetable: "#0A3323",
  Fruit: "#D4FF47",
  Grain: "#F59E0B",
  "Meat Protein": "#EF4444",
  "Fish Protein": "#F87171",
  "Dairy Protein": "#3B82F6",
  Dairy: "#60A5FA",
  Snack: "#8B5CF6",
  Fats: "#FCD34D",
  General: "#94A3B8",
};

export default function ConsumptionChart({ preloadedData }: { preloadedData: any }) {
  const [viewMode, setViewMode] = useState<"7d" | "30d">("7d");

  // --- 1. Data Processing ---
  const fullData = preloadedData?.chartData || [];
  const prediction = preloadedData?.prediction || "";
  const imbalances = preloadedData?.imbalances || [];

  // Filter data based on toggle
  const activeData = useMemo(() => {
    if (viewMode === "7d") return fullData.slice(-7);
    return fullData;
  }, [fullData, viewMode]);

  // Dynamic Category Extraction
  const dataKeys = useMemo(() => {
    const keys = new Set<string>();
    fullData.forEach((day: any) => {
      Object.keys(day).forEach((k) => {
        if (k !== "name" && k !== "date") keys.add(k);
      });
    });
    return Array.from(keys);
  }, [fullData]);

  // Calculate Total Calories
  const totalCalories = activeData.reduce((acc: number, day: any) => {
    const dayTotal = Object.keys(day).reduce((sum, key) => {
      if (key !== "name" && key !== "date" && typeof day[key] === "number") {
        return sum + day[key];
      }
      return sum;
    }, 0);
    return acc + dayTotal;
  }, 0);

  // --- 2. Render ---
  if (!preloadedData) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-[#0A3323]/50">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="text-sm font-medium">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* --- AI Insight Card --- */}
      {prediction && (
        <div className="bg-gradient-to-r from-[#0A3323] to-[#144532] p-1 rounded-3xl shadow-lg transform hover:scale-[1.005] transition-transform duration-300">
          <div className="bg-[#0A3323] rounded-[22px] p-6 text-[#F3F6F4] relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 bg-[#D4FF47] rounded-full shadow-md shadow-[#D4FF47]/20 text-[#0A3323]">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="text-[#D4FF47] font-bold uppercase tracking-widest text-xs mb-2">
                  Smart Insight
                </h3>
                <p className="text-lg font-serif leading-relaxed">
                  "{prediction}"
                </p>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#D4FF47] opacity-10 rounded-full blur-[50px]" />
          </div>
        </div>
      )}

      {/* --- Chart Section --- */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#0A3323]">
              Caloric Intake
            </h3>
            <p className="text-sm text-gray-500">Daily consumption per household member</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-end gap-3">
             {/* Toggle */}
             <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("7d")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    viewMode === "7d"
                      ? "bg-white text-[#0A3323] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setViewMode("30d")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    viewMode === "30d"
                      ? "bg-white text-[#0A3323] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  30 Days
                </button>
            </div>

            {/* Imbalance Badges */}
            <div className="flex flex-wrap gap-2 justify-end">
              {imbalances.length === 0 && totalCalories > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  <Check size={12} /> Balanced
                </span>
              )}
              {imbalances.map((item: any, idx: number) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                    item.status === "OVER"
                      ? "bg-red-50 text-red-600 border-red-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}
                >
                  {item.status === "OVER" ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                  {item.status === "OVER" ? "Limit" : "Boost"} {item.category}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-[450px] w-full pb-4"> 
          {totalCalories === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <AlertCircle size={32} className="mb-2 opacity-50" />
              <p className="font-medium">No consumption data found.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  // Fix: Rotate -90deg for 30d view to fit all labels
                  angle={viewMode === "30d" ? -90 : 0}
                  textAnchor={viewMode === "30d" ? "end" : "middle"}
                  height={viewMode === "30d" ? 60 : 30} 
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  dy={viewMode === "30d" ? 5 : 10}
                  interval={0} // Force show all labels
                />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                
                <Tooltip
                  cursor={{ fill: "#F3F6F4" }}
                  contentStyle={{
                    backgroundColor: "#0A3323",
                    color: "#F3F6F4",
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                  itemStyle={{ color: "#D4FF47" }}
                  formatter={(value: number, name: string) => [
                    `${value} kCal`,
                    name,
                  ]}
                />
                
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: "20px" }}
                />

                {/* Stacked Bars */}
                {dataKeys.map((cat) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={CATEGORY_COLORS[cat] || "#94A3B8"}
                    radius={[0, 0, 0, 0]}
                    barSize={viewMode === "7d" ? 40 : 12}
                    animationDuration={800}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer Hint */}
        <div className="mt-6 pt-6 border-t border-gray-50 flex items-start gap-3">
            <div className="p-2 bg-[#F3F6F4] rounded-full text-[#0A3323]">
                <CalendarDays size={18} />
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
            <strong>Tip:</strong> Use the toggle above to switch between a weekly detail view and a monthly trend.
            </p>
        </div>
      </div>
    </div>
  );
}