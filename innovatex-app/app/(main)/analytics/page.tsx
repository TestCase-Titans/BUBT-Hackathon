"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, Target } from "lucide-react";
import ConsumptionChart from "@/components/ConsumptionChart";
import WeeklyPieChart from "@/components/WeeklyPieChart"; // <--- Import the new chart
import PageWrapper from "@/components/PageWrapper";

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
            Understanding your consumption habits.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Bar Chart - Spans 2 Columns */}
          <div className="lg:col-span-2">
             <ConsumptionChart preloadedData={analyticsData} />
          </div>

          {/* NEW: Weekly Pie Chart - Spans 1 Column */}
          <div className="lg:col-span-1 h-[450px] lg:h-auto">
             <WeeklyPieChart data={analyticsData?.categoryBreakdown} />
          </div>

          {/* Logic Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Top Category */}
            <div className="bg-[#F3F6F4] p-6 rounded-3xl border border-[#0A3323]/10">
              <h4 className="font-bold text-[#0A3323] mb-2 flex items-center gap-2">
                <TrendingUp size={18} /> Top Category
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {loading ? "Calculating..." : (
                  <>
                    Based on your logs, <strong className="text-[#0A3323]">{metrics.topCategory.name}</strong> makes up <strong className="text-[#0A3323]">{metrics.topCategory.percentage}%</strong> of your diet.
                  </>
                )}
              </p>
            </div>

            {/* Card 2: Goal Tracker */}
            <div className="bg-[#FFF8E1] p-6 rounded-3xl border border-yellow-200">
              <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <Target size={18} /> Goal Tracker
              </h4>
              <p className="text-sm text-yellow-800 leading-relaxed mb-3">
                {loading ? "Calculating..." : (
                  <>
                    You have a <strong>{metrics.goalProgress}%</strong> consumption rate (food eaten vs. wasted).
                  </>
                )}
              </p>
              {!loading && (
                <div className="w-full bg-yellow-200/50 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${metrics.goalProgress}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}