"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon, CalendarDays } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Vegetable: "#0A3323", Fruit: "#D4FF47", Grain: "#F59E0B", "Meat Protein": "#EF4444",
  "Fish Protein": "#F87171", "Dairy Protein": "#3B82F6", Dairy: "#60A5FA",
  Snack: "#8B5CF6", Fats: "#FCD34D", General: "#94A3B8",
};
const FALLBACK_COLORS = ["#0A3323", "#166534", "#D4FF47", "#F59E0B", "#EF4444"];

export default function WeeklyPieChart({ chartData = [] }: { chartData?: any[] }) {
  const [viewMode, setViewMode] = useState<"7d" | "30d">("7d");

  const aggregatedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    const dataToAggregate = viewMode === "7d" ? chartData.slice(-7) : chartData;
    const totals: Record<string, number> = {};
    
    dataToAggregate.forEach((day) => {
      Object.keys(day).forEach((key) => {
        if (key !== "name" && key !== "date" && typeof day[key] === "number") {
          totals[key] = (totals[key] || 0) + day[key];
        }
      });
    });

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [chartData, viewMode]);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    
    const isLight = ["#D4FF47", "#F59E0B", "#FCD34D", "#60A5FA"].includes(CATEGORY_COLORS[name]);
    return (
      <text x={x} y={y} fill={isLight ? "#0A3323" : "white"} textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold pointer-events-none">
        <tspan x={x} dy="-0.6em">{name}</tspan>
        <tspan x={x} dy="1.2em">{(percent * 100).toFixed(0)}%</tspan>
      </text>
    );
  };

  if (!aggregatedData.length) return <div className="h-[400px] bg-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-gray-400"><PieIcon size={32} className="mb-2 opacity-50"/><p>No data.</p></div>;

  return (
    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#0A3323]">Diet Breakdown</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest">{viewMode === "7d" ? "Last 7 Days" : "Last 30 Days"}</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl scale-90">
          {(["7d", "30d"] as const).map(m => (
            <button key={m} onClick={() => setViewMode(m)} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase ${viewMode === m ? "bg-white text-[#0A3323] shadow-sm" : "text-gray-400"}`}>{m.toUpperCase()}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={aggregatedData} cx="50%" cy="50%" labelLine={false} label={renderLabel} outerRadius={110} dataKey="value">
              {aggregatedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} stroke="white" strokeWidth={3} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value} kCal`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}