"use client";

import { useEffect, useState } from "react";
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
  Loader2,
  Sparkles,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Check,
} from "lucide-react";

interface ConsumptionChartProps {
  preloadedData?: any;
}

export default function ConsumptionChart({
  preloadedData,
}: ConsumptionChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState("");
  const [imbalances, setImbalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (preloadedData) {
      setData(preloadedData.chartData || []);
      setPrediction(preloadedData.prediction || "");
      setImbalances(preloadedData.imbalances || []);
      setLoading(false);
    } else {
      fetch("/api/analytics")
        .then((res) => res.json())
        .then((res) => {
          if (res.chartData) setData(res.chartData);
          if (res.prediction) setPrediction(res.prediction);
          if (res.imbalances) setImbalances(res.imbalances);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [preloadedData]);

  if (loading)
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-[#0A3323]/50">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p className="text-sm font-medium">Analyzing nutritional data...</p>
      </div>
    );

  const totalCalories = data.reduce((acc, day) => {
    const dayTotal = Object.values(day).reduce(
      (sum: number, val) => (typeof val === "number" ? sum + val : sum),
      0
    );
    return acc + (dayTotal as number);
  }, 0);

  const allKeys = new Set<string>();
  data.forEach((d) =>
    Object.keys(d).forEach((k) => {
      if (k !== "name") allKeys.add(k);
    })
  );
  const categories = Array.from(allKeys);

  const colors: Record<string, string> = {
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

  return (
    <div className="space-y-6">
      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-[#0A3323] to-[#144532] p-1 rounded-3xl shadow-lg transform hover:scale-[1.01] transition-transform duration-300">
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

      {/* Chart Section */}
      <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#0A3323]">
              Avg. Caloric Intake
            </h3>
            <p className="text-sm text-gray-500">Per household member (kCal)</p>
          </div>

          {/* Imbalance Badges */}
          <div className="flex flex-wrap gap-2">
            {imbalances.length === 0 && totalCalories > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                <Check size={12} /> Balanced Diet
              </span>
            )}
            {imbalances.map((item, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                  item.status === "OVER"
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                }`}
              >
                {item.status === "OVER" ? (
                  <ArrowUp size={12} />
                ) : (
                  <ArrowDown size={12} />
                )}
                {item.status === "OVER" ? "Limit" : "Boost"} {item.category}
              </span>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full">
          {totalCalories === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <AlertCircle size={32} className="mb-2 opacity-50" />
              <p className="font-medium">No consumption data found.</p>
              <p className="text-xs mt-1">
                Log your meals to see calorie stats!
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
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
                  labelStyle={{
                    color: "#D4FF47",
                    marginBottom: "0.5rem",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                {categories.map((cat) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    stackId="a"
                    fill={colors[cat] || "#94a3b8"}
                    radius={[0, 0, 0, 0]}
                    barSize={40}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
