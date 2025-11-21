"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShoppingBag,
  Calendar,
  Utensils,
  Loader2,
  CheckCircle,
  Wheat,
  Coffee,
  Sun,
  Moon,
  ChefHat,
  TrendingUp,
  ArrowRight,
  Download, // Import Download icon
} from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { useNotification } from "@/context/NotificationContext";
import { THEME } from "@/lib/theme";

export default function MealPlanPage() {
  const [loading, setLoading] = useState(false);
  const [planData, setPlanData] = useState<any>(null);
  const { notify } = useNotification();

  const generatePlan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meal-plan", { method: "POST" });
      const result = await res.json();

      if (result.success) {
        setPlanData(result.data);
        notify("Chef AI has prepared your plan!", "success");
      } else {
        notify(result.error || "Failed to generate plan", "error");
      }
    } catch (error) {
      notify("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Export Function ---
  const handleExport = () => {
    if (!planData) return;

    try {
      const dataStr = JSON.stringify(planData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `eco-loop-plan-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      notify("Meal plan exported successfully!", "success");
    } catch (error) {
      console.error("Export failed", error);
      notify("Failed to export plan", "error");
    }
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-12 pt-8 px-6 lg:px-12 max-w-7xl mx-auto min-h-screen flex flex-col">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#D4FF47] rounded-xl">
                <ChefHat size={24} className="text-[#0A3323]" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
                AI Meal Plan
              </h2>
            </div>
            <p className="text-gray-500 max-w-md">
              Smart meal planning that prioritizes your expiring ingredients and
              budget.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* --- NEW: Export Button --- */}
            {planData && !loading && (
              <button
                onClick={handleExport}
                className="px-5 py-4 rounded-2xl font-bold flex items-center gap-2 bg-white border border-gray-200 text-[#0A3323] hover:bg-gray-50 transition-colors shadow-sm"
                title="Export Full Response"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Export JSON</span>
              </button>
            )}

            <button
              onClick={generatePlan}
              disabled={loading}
              className={`
                relative overflow-hidden group bg-[#0A3323] text-[#F3F6F4] px-8 py-4 rounded-2xl font-bold flex items-center gap-3 
                hover:shadow-xl hover:shadow-[#0A3323]/20 transition-all disabled:opacity-80 disabled:cursor-not-allowed
              `}
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-[#D4FF47]" size={20} />
                  <span>Crafting Menu...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} className="text-[#D4FF47]" />
                  <span>
                    {planData ? "Regenerate Menu" : "Create Meal Plan"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* --- EMPTY STATE --- */}
        {!planData && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-12 text-center shadow-sm"
          >
            <div
              className="w-32 h-32 bg-[#F3F6F4] rounded-full flex items-center justify-center mb-8 relative group cursor-pointer"
              onClick={generatePlan}
            >
              <div className="absolute inset-0 border-2 border-[#D4FF47] rounded-full border-dashed animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity" />
              <Utensils size={48} className="text-[#0A3323]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#0A3323] mb-3">
              What&apos;s for Dinner?
            </h3>
            <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
              Our AI Chef analyzes your inventory to create a zero-waste,
              budget-friendly meal plan for the week.
            </p>
            <button
              onClick={generatePlan}
              className="text-[#0A3323] font-bold flex items-center gap-2 hover:gap-4 transition-all group"
            >
              Start Planning <ArrowRight size={18} className="text-[#D4FF47]" />
            </button>
          </motion.div>
        )}

        {/* --- LOADING STATE --- */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-gray-100 border-t-[#D4FF47] rounded-full animate-spin mb-8" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ChefHat size={24} className="text-[#0A3323] animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-serif text-[#0A3323] mb-2">
              The AI is Cooking...
            </h3>
            <p className="text-gray-500">
              Checking expiry dates & finding local recipes.
            </p>
          </div>
        )}

        {/* --- PLAN DISPLAY --- */}
        {planData && !loading && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: The Plan (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Impact Card */}
              <motion.div
                variants={item}
                className="bg-gradient-to-br from-[#0A3323] to-[#0F4D34] p-8 rounded-[2rem] text-[#F3F6F4] shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Wheat size={120} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#D4FF47]/20 rounded-lg backdrop-blur-sm">
                      <TrendingUp className="text-[#D4FF47]" size={20} />
                    </div>
                    <h4 className="font-bold text-lg tracking-wide">
                      Sustainability Impact
                    </h4>
                  </div>

                  <p className="text-lg md:text-xl font-serif leading-relaxed text-white/90 mb-6">
                    {planData.analysis.wasteSaved}
                  </p>

                  {planData.analysis.habitNote && (
                    <div className="inline-block bg-white/10 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
                      <p className="text-xs font-bold text-[#D4FF47] uppercase tracking-wider mb-1">
                        Chef&apos;s Note
                      </p>
                      <p className="text-sm text-white/80 italic">
                        &quot;{planData.analysis.habitNote}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Weekly Plan Grid */}
              <div className="grid gap-4">
                {planData.plan.map((day: any, i: number) => (
                  <motion.div
                    key={i}
                    variants={item}
                    className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 hover:border-[#D4FF47]/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                      <div className="w-10 h-10 rounded-full bg-[#F3F6F4] flex items-center justify-center group-hover:bg-[#D4FF47] transition-colors">
                        <Calendar
                          size={18}
                          className="text-gray-400 group-hover:text-[#0A3323]"
                        />
                      </div>
                      <h3 className="font-serif font-bold text-xl text-[#0A3323]">
                        {day.day}
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Breakfast */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <Coffee size={14} /> Breakfast
                        </div>
                        <p className="text-gray-700 font-medium bg-[#F3F6F4] p-3 rounded-xl text-sm border border-transparent hover:border-gray-200 transition-colors">
                          {day.meals.breakfast}
                        </p>
                      </div>

                      {/* Lunch */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#D97706] uppercase tracking-wider">
                          <Sun size={14} /> Lunch
                        </div>
                        <p className="text-gray-700 font-medium bg-[#FFFBEB] p-3 rounded-xl text-sm border border-[#FEF3C7]">
                          {day.meals.lunch}
                        </p>
                      </div>

                      {/* Dinner */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5] uppercase tracking-wider">
                          <Moon size={14} /> Dinner
                        </div>
                        <p className="text-gray-700 font-medium bg-[#EEF2FF] p-3 rounded-xl text-sm border border-[#E0E7FF]">
                          {day.meals.dinner}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column: Shopping List (4 cols) */}
            <motion.div variants={item} className="lg:col-span-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 sticky top-24">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-serif font-bold text-[#0A3323] flex items-center gap-2">
                    <ShoppingBag
                      size={20}
                      className="text-[#D4FF47] fill-[#0A3323]"
                    />
                    Shopping List
                  </h3>
                </div>

                {/* Receipt Style List */}
                <div className="space-y-0 relative">
                  {/* Dotted Line Top */}
                  <div className="absolute -top-4 left-0 right-0 border-b-2 border-dashed border-gray-200" />

                  {planData.shoppingList.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 border-b border-gray-50 group hover:bg-gray-50 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded border-2 border-gray-300 group-hover:border-[#0A3323] flex items-center justify-center transition-colors cursor-pointer">
                          <div className="w-2 h-2 bg-[#0A3323] rounded-sm opacity-0 group-active:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-[#0A3323]">
                          {item.item}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-gray-400 group-hover:text-[#0A3323]">
                        ৳{item.estimatedCost}
                      </span>
                    </div>
                  ))}

                  {/* Total */}
                  <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      Est. Total
                    </span>
                    <span className="text-2xl font-serif font-bold text-[#0A3323]">
                      ৳
                      {planData.shoppingList.reduce(
                        (acc: any, curr: any) => acc + curr.estimatedCost,
                        0
                      )}
                    </span>
                  </div>
                </div>

                {/* Decorative Receipt Jagged Edge */}
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-[radial-gradient(circle,transparent_50%,#ffffff_50%)] bg-[length:16px_16px] rotate-180" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageWrapper>
  );
}
