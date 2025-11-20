"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Leaf, ChevronRight, Star, Sparkles } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { useApp } from "@/context/AppContext"; // Import Context

export default function ResourcesPage() {
  const { inventory } = useApp(); // Get Inventory
  const [resources, setResources] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [others, setOthers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(data);
      });
  }, []);

  // --- RECOMMENDATION LOGIC ---
  useEffect(() => {
    if (resources.length > 0) {
      // 1. Extract all unique categories currently in the user's pantry
      // inventory item.category is now an array like ['Vegetable', 'Vegetable Protein']
      const userCategories = new Set<string>();
      
      const safeInventory = Array.isArray(inventory) ? inventory : [];
      
      safeInventory.forEach((item: any) => {
        if (Array.isArray(item.category)) {
          item.category.forEach((cat: string) => userCategories.add(cat));
        } else if (typeof item.category === 'string') {
          userCategories.add(item.category);
        }
      });

      // 2. Filter Resources
      const recs: any[] = [];
      const rest: any[] = [];

      resources.forEach(res => {
        // Logic: Recommend if resource category matches any of user's inventory tags
        // OR if it's a broad category like "General" or "Waste Reduction"
        const isRelevant = 
            userCategories.has(res.category) || 
            ["General", "Waste Reduction"].includes(res.category) ||
            // Partial matching: e.g. User has "Meat Protein", Resource is "Protein"
            Array.from(userCategories).some(userCat => userCat.includes(res.category));

        if (isRelevant) {
            recs.push(res);
        } else {
            rest.push(res);
        }
      });

      setRecommended(recs);
      setOthers(rest);
    }
  }, [resources, inventory]);

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 overflow-y-auto h-full max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-2">
            Library
            </h2>
            <p className="text-gray-500">Smart guides tailored to your pantry.</p>
        </div>

        {/* --- SECTION 1: RECOMMENDATIONS --- */}
        {recommended.length > 0 && (
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-[#D4FF47] fill-[#D4FF47]" size={20} />
                    <h3 className="text-xl font-bold text-[#0A3323]">Recommended for You</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {/* Call to Action Card */}
                    <div className="bg-[#0A3323] p-6 rounded-2xl text-[#F3F6F4] text-center flex flex-col justify-center shadow-lg">
                        <div className="w-12 h-12 bg-[#D4FF47] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-[#D4FF47]/20">
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

                    {recommended.map((resource: any) => (
                        <ResourceCard key={resource.id} resource={resource} recommended={true} />
                    ))}
                </div>
            </div>
        )}

        {/* --- SECTION 2: EXPLORE --- */}
        {others.length > 0 && (
            <div>
                <h3 className="text-xl font-bold text-[#0A3323] mb-6 border-t border-gray-200 pt-8">Explore More</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.map((resource: any) => (
                        <ResourceCard key={resource.id} resource={resource} />
                    ))}
                </div>
            </div>
        )}
      </div>
    </PageWrapper>
  );
}

// Sub-component for cleaner code
function ResourceCard({ resource, recommended }: { resource: any, recommended?: boolean }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border group cursor-pointer flex flex-col h-full ${recommended ? 'border-[#D4FF47] ring-1 ring-[#D4FF47]/20' : 'border-gray-100'}`}
        >
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#F3F6F4] rounded text-gray-500">
                    {resource.type}
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${recommended ? 'bg-[#D4FF47] text-[#0A3323]' : 'bg-gray-100 text-gray-500'}`}>
                    {resource.category}
                </span>
            </div>
            <h3 className="font-bold text-xl text-[#0A3323] mb-3 leading-tight">
                {resource.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                {resource.content}
            </p>
            <div className="flex items-center text-[#0A3323] text-xs font-bold mt-auto">
                <span className="group-hover:underline">Read Full Guide</span>
                <ChevronRight
                    size={14}
                    className="ml-1 group-hover:translate-x-1 transition-transform"
                />
            </div>
        </motion.div>
    );
}