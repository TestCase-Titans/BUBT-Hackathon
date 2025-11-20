"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Leaf, ChevronRight, Star } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { useApp } from "@/context/AppContext";

export default function ResourcesPage() {
  const { inventory } = useApp();
  const [resources, setResources] = useState([]);

  // Derive Active Categories from Inventory
  const userCategories = new Set(
    (inventory || [])
      .filter((item: any) => item.status === "ACTIVE" && item.quantity > 0)
      .map((item: any) => item.category)
  );

  useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        // Process resources to add a "isRecommended" flag
        const processedData = data.map((res: any) => ({
          ...res,
          // The Logic: If resource category is in user's pantry categories, it's recommended
          isRecommended: userCategories.has(res.category),
          recommendationReason: userCategories.has(res.category)
            ? `Related to: ${res.category} in your pantry`
            : null,
        }));

        // Sort: Recommended first
        processedData.sort((a: any, b: any) =>
          b.isRecommended === a.isRecommended ? 0 : b.isRecommended ? 1 : -1
        );

        setResources(processedData);
      });
  }, [inventory]);

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 overflow-y-auto h-full max-w-7xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-2">
          Library
        </h2>
        <p className="text-gray-500 mb-8">Guides tailored to your kitchen.</p>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          <div className="break-inside-avoid bg-[#0A3323] p-6 rounded-2xl text-[#F3F6F4] text-center mb-6">
            <div className="w-12 h-12 bg-[#D4FF47] rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-[#0A3323]" />
            </div>
            <h3 className="font-serif text-2xl mb-2">Zero Waste Challenge</h3>
            <p className="text-sm text-[#F3F6F4]/70 mb-6">
              Join 500+ locals reducing their footprint this week.
            </p>
            <button className="w-full py-3 bg-[#D4FF47] text-[#0A3323] rounded-xl font-bold text-sm hover:bg-white transition-colors">
              Join Now
            </button>
          </div>

          {resources.map((resource: any, idx: number) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`break-inside-avoid bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border ${
                resource.isRecommended
                  ? "border-[#D4FF47] ring-1 ring-[#D4FF47]/50"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#F3F6F4] rounded text-gray-500">
                  {resource.type}
                </span>

                {/* Recommendation Badge */}
                {resource.isRecommended && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[#0A3323] bg-[#D4FF47] px-2 py-1 rounded-full">
                    <Star size={10} fill="currentColor" /> Recommended
                  </span>
                )}
              </div>

              <h3 className="font-bold text-xl text-[#0A3323] mb-3 leading-tight">
                {resource.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                {resource.content}
              </p>

              {/* Reason for recommendation */}
              {resource.isRecommended && (
                <div className="mb-4 text-xs text-[#0A3323] font-medium bg-[#0A3323]/5 p-2 rounded-lg">
                  💡 {resource.recommendationReason}
                </div>
              )}

              <div className="flex items-center text-[#0A3323] text-xs font-bold cursor-pointer group">
                <span className="group-hover:underline">Read Full Guide</span>
                <ChevronRight
                  size={14}
                  className="ml-1 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
