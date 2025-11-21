"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { PieChart as PieIcon } from "lucide-react";

interface WeeklyPieChartProps {
  data?: any[];
}

export default function WeeklyPieChart({ data }: WeeklyPieChartProps) {
  // 1. Safe check for data
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] bg-white p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-gray-400">
        <PieIcon className="mb-2 opacity-50" size={32} />
        <p className="text-sm font-medium">No consumption data yet.</p>
      </div>
    );
  }

  // 2. Custom Theme Colors
  const COLORS = ["#0A3323", "#166534", "#D4FF47", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6", "#ECFCCB"];

  // 3. Custom Label Render Function (Places text inside the slice)
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    // Calculate position: 50% distance from center
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if slice is big enough (> 5%)
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill={index === 2 || index === 7 ? "#0A3323" : "white"} // Dark text on light colors
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-[10px] md:text-xs font-bold"
      >
        {/* Tspan allows for line breaks in SVG */}
        <tspan x={x} dy="-0.6em">{name}</tspan>
        <tspan x={x} dy="1.2em">{(percent * 100).toFixed(0)}%</tspan>
      </text>
    );
  };
  
  let index = 0; // Helper for coloring

  return (
    <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-bold text-[#0A3323]">
          What Did I Eat?
        </h3>
        <p className="text-xs text-gray-500 uppercase tracking-widest">Weekly Category Breakdown</p>
      </div>

      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel} // Uses our custom label logic
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, i) => {
                index = i;
                return (
                  <Cell 
                    key={`cell-${i}`} 
                    fill={COLORS[i % COLORS.length]} 
                    stroke="white"
                    strokeWidth={2}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}