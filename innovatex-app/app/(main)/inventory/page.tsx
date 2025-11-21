"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Search,
  X,
  Calendar,
  Coins,
  Utensils,
  AlertTriangle,
  ArrowLeft,
  Hash,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ThermometerSun,
  Info
} from "lucide-react";
import { THEME } from "@/lib/theme";
import { useApp } from "@/context/AppContext";
import PageWrapper from "@/components/PageWrapper";
import { useNotification } from "@/context/NotificationContext";

const CATEGORIES = [
  "All",
  "Meat Protein",
  "Fish Protein",
  "Dairy Protein",
  "Vegetable Protein",
  "Vegetable",
  "Fruit",
  "Grain",
  "Dairy",
  "Spices",
  "Fats",
  "Snack",
  "Canned",
  "General"
];

const ItemIcon = ({ src, alt, className, size = "text-3xl" }: { src: string, alt: string, className: string, size?: string }) => {
  const isUrl = src && (src.startsWith("http") || src.startsWith("/"));
  
  return (
    <div className={`${className} flex items-center justify-center bg-[#F3F6F4] overflow-hidden`}>
      {isUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={(e) => {
               e.currentTarget.style.display = 'none'; 
          }}
        />
      ) : (
        <span className={size}>{src || "📦"}</span>
      )}
    </div>
  );
};

// Helper for Risk Badge Styling
const getRiskBadge = (score: number, label: string) => {
  if (score >= 80 || label === 'Critical') return { color: "bg-red-100 text-red-700 border-red-200", icon: <ShieldAlert size={12}/>, bar: 'bg-red-500' };
  if (score >= 50 || label === 'High') return { color: "bg-orange-100 text-orange-700 border-orange-200", icon: <ThermometerSun size={12}/>, bar: 'bg-orange-500' };
  if (score >= 30 || label === 'Medium') return { color: "bg-amber-100 text-amber-700 border-amber-200", icon: <Info size={12}/>, bar: 'bg-amber-500' };
  return { color: "bg-green-100 text-green-700 border-green-200", icon: <ShieldCheck size={12}/>, bar: 'bg-green-500' };
};

export default function InventoryPage() {
  const { inventory, setInventory } = useApp();
  const [filter, setFilter] = useState("All");
  const { notify } = useNotification();
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Data States
  const [foodDatabase, setFoodDatabase] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Configuration State
  const [configuringFood, setConfiguringFood] = useState<any>(null);
  const [addItemForm, setAddItemForm] = useState({
    quantity: 1,
    unit: "pcs",
    expiryDays: 7,
    cost: 0,
  });

  const [actionForm, setActionForm] = useState({
    quantity: 0,
    type: "CONSUME" 
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- 1. Silent Risk Analysis on Mount ---
  useEffect(() => {
    const runRiskAnalysis = async () => {
      try {
        setIsAnalyzing(true);
        // Fire API call
        const res = await fetch('/api/predictions/risk', { method: 'POST' });
        const data = await res.json();
        
        // If backend updated records, refresh our local state
        if (data.success && data.updated > 0) {
           refreshInventory();
        }
      } catch (e) {
        console.error("Background risk check failed", e);
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    // Only run if we have items
    if (inventory && inventory.length > 0) {
        runRiskAnalysis();
    }
  }, [inventory.length]); // Run when inventory length changes (e.g. initial load)

  const refreshInventory = async () => {
      const res = await fetch("/api/inventory");
      if (res.ok) {
          const data = await res.json();
          setInventory(data);
      }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      };
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, []);

  useEffect(() => {
    if (isAddModalOpen && foodDatabase.length === 0) {
      setLoadingFoods(true);
      fetch("/api/foods")
        .then((res) => res.json())
        .then((data) => {
          setFoodDatabase(data);
          setLoadingFoods(false);
        })
        .catch((err) => {
          console.error("Failed to load foods", err);
          setLoadingFoods(false);
        });
    }
  }, [isAddModalOpen]);

  useEffect(() => {
    if (!isAddModalOpen) {
        setConfiguringFood(null);
        setSearchTerm("");
    }
  }, [isAddModalOpen]);

  const safeInventory = Array.isArray(inventory) ? inventory : [];
  
  const filteredItems =
    filter === "All"
      ? safeInventory.filter((i:any) => i.status === 'ACTIVE' && i.quantity > 0)
      : safeInventory.filter((item: any) => {
          const categories = Array.isArray(item.category) ? item.category : [item.category];
          return categories.includes(filter) && item.status === 'ACTIVE' && item.quantity > 0;
      });

  // --- 2. Smart Sort by Risk Score ---
  const sortedItems = [...filteredItems].sort((a: any, b: any) => {
    // Sort by Risk Score (Highest first)
    return (b.riskScore || 0) - (a.riskScore || 0);
  });

  const handleSelectFood = (foodItem: any) => {
    setConfiguringFood(foodItem);
    setAddItemForm({
        quantity: 1,
        unit: foodItem.unit || "pcs",
        expiryDays: foodItem.typicalExpiryDays || 7,
        cost: foodItem.costPerUnit || 0
    });
  };

  const handleConfirmAdd = async () => {
    if (!configuringFood || isSubmitting) return;
    setIsSubmitting(true);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + addItemForm.expiryDays);

    const newItem = {
      name: configuringFood.name,
      category: configuringFood.category,
      quantity: addItemForm.quantity,
      unit: addItemForm.unit,
      expirationDate: expiryDate,
      costPerUnit: addItemForm.cost,
      imageUrl: configuringFood.image,
    };

    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        const savedItem = await res.json();
        setInventory((prev: any) => [...prev, {
            ...savedItem, 
            id: savedItem._id, 
            image: savedItem.imageUrl || "📦", 
            expiryDays: addItemForm.expiryDays,
            // Default new item risk
            riskScore: 0,
            riskLabel: "Safe"
        }]);
        setIsAddModalOpen(false);
        setConfiguringFood(null);
        notify(`${newItem.name} added to pantry`, "success");
      }
    } catch (error) {
      console.error("Failed to add item", error);
      notify("Failed to add item", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccidentalDelete = async () => {
    if (!selectedItem || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await fetch(`/api/inventory/${selectedItem.id}`, { method: "DELETE" });
      setInventory(safeInventory.filter((i: any) => i.id !== selectedItem.id));
      notify("Item deleted", "info");
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed", error);
      notify("Failed to delete item", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openActionModal = (type: "CONSUME" | "WASTE") => {
    setActionForm({ quantity: selectedItem.quantity, type });
    setIsActionModalOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedItem || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            action: actionForm.type, 
            quantity: Number(actionForm.quantity) 
        }),
      });

      if (res.ok) {
        setInventory((prev: any[]) => prev.map(item => {
            if (item.id === selectedItem.id) {
                const newQty = item.quantity - Number(actionForm.quantity);
                return {
                    ...item,
                    quantity: newQty > 0 ? newQty : 0,
                    status: newQty > 0 ? 'ACTIVE' : (actionForm.type === 'WASTE' ? 'WASTED' : 'CONSUMED')
                };
            }
            return item;
        }));

        setIsActionModalOpen(false);
        setSelectedItem(null); 
        const actionText = actionForm.type === 'CONSUME' ? 'consumed' : 'wasted';
        notify(`Item marked as ${actionText}`, "success");
      }
    } catch (error) {
      console.error("Update failed", error);
      notify("Failed to update stock", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 h-full flex flex-col max-w-7xl mx-auto relative">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2">
                <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
                    My Pantry
                </h2>
                {isAnalyzing && <Loader2 className="animate-spin text-[#D4FF47]" size={20} />}
            </div>
            <p className="text-gray-500">Manage your food and reduce waste.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0A3323] text-[#D4FF47] px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#0F4D34] transition-colors shadow-lg w-fit"
          >
            <Plus size={20} /> Add Item
          </button>
        </div>

        {/* Filters */}
        <div 
          ref={scrollContainerRef}
          className="p-5 flex gap-2 overflow-x-auto pb-4 lg:pb-6 cursor-grab active:cursor-grabbing no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                filter === cat
                  ? "bg-[#0A3323] text-[#D4FF47] border-[#0A3323]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#0A3323]"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Inventory Grid */}
        <div className="flex-1">
          {sortedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <p className="font-medium">No items found.</p>
              <p className="text-xs mt-2">
                Click "Add Item" to restock.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
              <AnimatePresence mode="popLayout">
                {sortedItems.map((item: any) => {
                  // Calculate Risk Badge
                  const riskStyle = getRiskBadge(item.riskScore || 0, item.riskLabel || "Safe");
                  
                  return (
                    <motion.div
                      key={item.id || item._id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedItem(item)}
                      className={`${THEME.glass} p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-[#D4FF47]/50 transition-all relative overflow-hidden group border border-white/40`}
                    >
                      {/* --- NEW: Risk Indicator Bar --- */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${riskStyle.bar}`} />

                      <ItemIcon 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 rounded-2xl flex-shrink-0 ml-2" // Added ml-2 for bar
                          size="text-3xl"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[#0A3323] truncate pr-2 text-lg">
                            {item.name}
                          </h3>
                        </div>

                        {/* --- NEW: Risk Badge & Factor --- */}
                        <div className="flex items-center gap-2 mt-1 mb-1">
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${riskStyle.color}`}>
                                {riskStyle.icon}
                                <span>{item.riskLabel || "Safe"}</span>
                            </div>
                            
                            {item.riskScore > 30 && item.riskFactor && (
                                <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                    {item.riskFactor}
                                </span>
                            )}
                        </div>

                        <div className="flex justify-between mt-2 items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-white border border-gray-100 px-2 py-0.5 rounded-md text-gray-600">
                                {Number(item.quantity).toFixed(1).replace(/\.0$/, '')} {item.unit}
                            </span>
                            <span className={`text-[10px] font-bold ${item.expiryDays < 3 ? "text-[#FF6B6B]" : "text-gray-400"}`}>
                                {item.expiryDays} days left
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* --- ADD ITEM MODAL --- */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 lg:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="bg-[#F3F6F4] w-full max-w-lg rounded-t-3xl lg:rounded-3xl p-6 z-10 shadow-2xl max-h-[85vh] flex flex-col"
              >
                {/* ... (Same Add Item Modal Content) ... */}
                <div className="flex justify-between items-center mb-6">
                    {configuringFood ? (
                        <button onClick={() => setConfiguringFood(null)} className="p-2 hover:bg-gray-200 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                    ) : (
                          <h3 className="text-2xl font-serif text-[#0A3323]">Add to Pantry</h3>
                    )}
                    <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                {configuringFood ? (
                    <div className="space-y-6">
                         {/* ... Form ... */}
                        <div className="flex items-center gap-4">
                             <ItemIcon 
                                src={configuringFood.image} 
                                alt={configuringFood.name} 
                                className="w-16 h-16 rounded-2xl flex-shrink-0"
                                size="text-4xl"
                            />
                            <div>
                                <h4 className="text-xl font-bold text-[#0A3323]">{configuringFood.name}</h4>
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-md">{configuringFood.category}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">Quantity</label>
                                <div className="flex items-center bg-white rounded-xl p-3 shadow-sm">
                                    <Hash size={18} className="text-gray-400 mr-2"/>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={addItemForm.quantity}
                                        onChange={(e) => setAddItemForm({...addItemForm, quantity: Number(e.target.value)})}
                                        className="w-full outline-none font-bold text-[#0A3323]"
                                    />
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">Unit</label>
                                <div className="flex items-center bg-white rounded-xl p-3 shadow-sm">
                                    <input 
                                        type="text" 
                                        value={addItemForm.unit}
                                        onChange={(e) => setAddItemForm({...addItemForm, unit: e.target.value})}
                                        className="w-full outline-none font-bold text-[#0A3323]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">Expires In (Days)</label>
                                <div className="flex items-center bg-white rounded-xl p-3 shadow-sm">
                                    <Calendar size={18} className="text-gray-400 mr-2"/>
                                    <input 
                                        type="number" 
                                        value={addItemForm.expiryDays}
                                        onChange={(e) => setAddItemForm({...addItemForm, expiryDays: Number(e.target.value)})}
                                        className="w-full outline-none font-bold text-[#0A3323]"
                                    />
                                </div>
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400">Cost Per Unit</label>
                                <div className="flex items-center bg-white rounded-xl p-3 shadow-sm">
                                    <span className="text-gray-400 mr-2 font-bold text-lg">৳</span>
                                    <input 
                                        type="number"
                                        step="1"
                                        min="0"
                                        value={addItemForm.cost}
                                        onChange={(e) => setAddItemForm({...addItemForm, cost: Number(e.target.value)})}
                                        className="w-full outline-none font-bold text-[#0A3323]"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleConfirmAdd}
                            disabled={isSubmitting} 
                            className="w-full bg-[#0A3323] text-[#D4FF47] py-4 rounded-xl font-bold text-lg hover:bg-[#0F4D34] transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                            {isSubmitting ? "Adding..." : "Confirm & Add"}
                        </button>
                    </div>
                ) : (
                      <>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input
                                type="text"
                                placeholder="Search food database..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-white shadow-sm focus:ring-2 focus:ring-[#0A3323] outline-none"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {loadingFoods ? (
                            <div className="text-center p-8 text-gray-400">Loading foods...</div>
                        ) : (
                            foodDatabase
                                .filter((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((food) => (
                                <div
                                    key={food.id}
                                    onClick={() => handleSelectFood(food)}
                                    className="bg-white p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#D4FF47]/20 transition-colors group border border-transparent hover:border-[#D4FF47]"
                                >
                                    <div className="flex items-center gap-3">
                                    <ItemIcon 
                                        src={food.image} 
                                        alt={food.name} 
                                        className="w-10 h-10 rounded-lg flex-shrink-0"
                                        size="text-2xl"
                                    />
                                    <div>
                                        <p className="font-bold text-[#0A3323]">{food.name}</p>
                                        <p className="text-xs text-gray-500">Expires in ~{food.typicalExpiryDays} days</p>
                                    </div>
                                    </div>
                                    <Plus className="text-[#0A3323] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                ))
                        )}
                         </div>
                    </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- CONSUME / WASTE ACTION MODAL (Unchanged) --- */}
         <AnimatePresence>
            {isActionModalOpen && selectedItem && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{opacity: 0}} animate={{opacity:1}} exit={{opacity:0}}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsActionModalOpen(false)}
                    />
                    <motion.div 
                        initial={{scale: 0.9, opacity: 0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}
                        className="bg-white w-full max-w-sm rounded-3xl p-6 z-[70] relative"
                    >
                          <h3 className="text-xl font-bold text-[#0A3323] mb-4">
                            {actionForm.type === 'CONSUME' ? 'Consume Item' : 'Record Wastage'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            How much {selectedItem.name} did you {actionForm.type === 'CONSUME' ? 'use' : 'waste'}?
                          </p>

                          <div className="flex items-center justify-between bg-[#F3F6F4] p-4 rounded-2xl mb-6">
                             <input 
                                type="number" 
                                min="0" 
                                max={selectedItem.quantity}
                                step="0.01"
                                value={actionForm.quantity}
                                onChange={(e) => setActionForm({...actionForm, quantity: Number(e.target.value)})}
                                className="bg-transparent text-3xl font-bold text-[#0A3323] w-24 outline-none"
                             />
                             <span className="font-bold text-gray-400">{selectedItem.unit}</span>
                          </div>

                          <div className="flex gap-3">
                            <button onClick={() => setIsActionModalOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancel</button>
                            <button 
                                onClick={handleUpdateStock}
                                disabled={isSubmitting} 
                                className={`flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 
                                    ${actionForm.type === 'CONSUME' ? 'bg-[#0A3323]' : 'bg-[#FF6B6B]'}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Confirm"}
                            </button>
                          </div>
                    </motion.div>
                </div>
            )}
         </AnimatePresence>


        {/* --- ITEM DETAILS MODAL (Updated to show Risk Info) --- */}
        <AnimatePresence>
          {selectedItem && !isActionModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white w-full max-w-md rounded-3xl p-8 z-10 shadow-2xl relative"
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                  <ItemIcon 
                        src={selectedItem.image} 
                        alt={selectedItem.name} 
                        className="w-24 h-24 rounded-full mb-4"
                        size="text-5xl"
                    />
                  <h3 className="text-3xl font-serif text-[#0A3323]">
                    {selectedItem.name}
                  </h3>
                  
                  {/* --- NEW: Big Risk Badge --- */}
                  <div className={`mt-3 px-4 py-1 rounded-full text-sm font-bold border flex items-center gap-2 ${getRiskBadge(selectedItem.riskScore, selectedItem.riskLabel).color}`}>
                    {getRiskBadge(selectedItem.riskScore, selectedItem.riskLabel).icon}
                    {selectedItem.riskLabel || "Safe"} Risk ({selectedItem.riskScore}%)
                  </div>
                  {selectedItem.riskFactor && (
                    <span className="text-xs text-gray-400 mt-1 italic">
                      "{selectedItem.riskFactor}"
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-[#F3F6F4] rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                      <Calendar size={14} /> Expiry
                    </div>
                    <p className={`text-xl font-bold ${selectedItem.expiryDays < 3 ? "text-[#FF6B6B]" : "text-[#0A3323]"}`}>
                      {selectedItem.expiryDays} Days
                    </p>
                  </div>
                  <div className="p-4 bg-[#F3F6F4] rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                      <Coins size={14} /> Value
                    </div>
                    <p className="text-xl font-bold text-[#0A3323]">
                      ৳{selectedItem.costPerUnit || "0.00"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => openActionModal("CONSUME")}
                    className="w-full py-3 bg-[#0A3323] text-[#D4FF47] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0F4D34]"
                  >
                    <Utensils size={18} /> Consume
                  </button>
                  <div className="flex gap-3">
                    <button
                        onClick={() => openActionModal("WASTE")}
                        className="flex-1 py-3 bg-[#FFEDED] text-[#FF6B6B] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#FFDBDB]"
                    >
                        <AlertTriangle size={18} /> Record Waste
                    </button>
                    <button
                        onClick={handleAccidentalDelete}
                        disabled={isSubmitting} 
                        className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                        {isSubmitting ? "" : "Delete"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}