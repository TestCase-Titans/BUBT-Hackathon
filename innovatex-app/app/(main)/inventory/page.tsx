"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Plus,
  Search,
  X,
  Calendar,
  CheckCircle,
  ArrowLeft,
  Hash,
  Coins,
  Utensils,
  AlertTriangle
} from "lucide-react";
import { THEME } from "@/lib/theme";
import { useApp } from "@/context/AppContext";
import PageWrapper from "@/components/PageWrapper";

const CATEGORIES = [
  "All",
  "Dairy",
  "Vegetable",
  "Fruit",
  "Grain",
  "Protein",
  "Canned",
];

export default function InventoryPage() {
  const { inventory, setInventory } = useApp();
  const [filter, setFilter] = useState("All");
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Data States
  const [foodDatabase, setFoodDatabase] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingFoods, setLoadingFoods] = useState(false);

  // Configuration State
  const [configuringFood, setConfiguringFood] = useState<any>(null);
  const [addItemForm, setAddItemForm] = useState({
    quantity: 1,
    unit: "pcs",
    expiryDays: 7,
    cost: 0,
  });

  // Action Form (Consume/Waste)
  const [actionForm, setActionForm] = useState({
    quantity: 0,
    type: "CONSUME" // or WASTE
  });

  // Fetch Master Database
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

  // Reset config when modal closes
  useEffect(() => {
    if (!isAddModalOpen) {
        setConfiguringFood(null);
        setSearchTerm("");
    }
  }, [isAddModalOpen]);

  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const filteredItems =
    filter === "All"
      ? safeInventory.filter((i:any) => i.status === 'ACTIVE' && i.quantity > 0) // Hide consumed items
      : safeInventory.filter((item: any) => item.category === filter && item.status === 'ACTIVE' && item.quantity > 0);

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
    if (!configuringFood) return;

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
        // Re-format for frontend
        const formatted = {
          id: savedItem._id,
          name: savedItem.name,
          category: savedItem.category,
          quantity: savedItem.quantity,
          unit: savedItem.unit,
          image: savedItem.imageUrl || "📦",
          expiryDays: addItemForm.expiryDays,
          status: savedItem.status,
          costPerUnit: savedItem.costPerUnit
        };
        
        setInventory((prev: any) => [...prev, formatted]);
        setIsAddModalOpen(false);
        setConfiguringFood(null);
      }
    } catch (error) {
      console.error("Failed to add item", error);
    }
  };

  // 1. Accidental Delete (Hard Delete)
  const handleAccidentalDelete = async () => {
    if (!selectedItem) return;
    try {
      await fetch(`/api/inventory/${selectedItem.id}`, { method: "DELETE" });
      setInventory(safeInventory.filter((i: any) => i.id !== selectedItem.id));
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  // 2. Open Action Modal
  const openActionModal = (type: "CONSUME" | "WASTE") => {
    setActionForm({ quantity: selectedItem.quantity, type });
    setIsActionModalOpen(true);
  };

  // 3. Submit Consumption/Wastage
  const handleUpdateStock = async () => {
    if (!selectedItem) return;

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
        const updatedItem = await res.json();
        
        setInventory((prev: any[]) => prev.map(item => {
            if (item.id === selectedItem.id) {
                // Determine new status locally to update UI instantly
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
        setSelectedItem(null); // Close main modal
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 h-full flex flex-col max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
              My Pantry
            </h2>
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
        <div className="flex gap-2 overflow-x-auto pb-4 lg:pb-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                filter === cat
                  ? "bg-[#0A3323] text-[#D4FF47] border-[#0A3323]"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[#0A3323]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inventory Grid */}
        <div className="flex-1">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <p className="font-medium">No items found.</p>
              <p className="text-xs mt-2">
                Click "Add Item" to restock.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item: any) => (
                  <motion.div
                    key={item.id || item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedItem(item)}
                    className={`${
                      THEME.glass
                    } p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:shadow-lg hover:border-[#D4FF47]/50 transition-all border-l-4 ${
                      item.expiryDays < 3
                        ? "border-l-[#FF6B6B]"
                        : "border-l-transparent"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#F3F6F4] text-3xl flex items-center justify-center flex-shrink-0">
                      {item.image || "📦"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[#0A3323] truncate pr-2 text-lg">
                          {item.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono bg-white border border-gray-100 px-2 py-0.5 rounded-md text-gray-600">
                          {Number(item.quantity).toFixed(1).replace(/\.0$/, '')} {item.unit}
                        </span>
                        {item.costPerUnit && (
                          <span className="text-xs text-gray-400">
                            ৳{item.costPerUnit}/{item.unit}
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between mt-3 items-center">
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.expiryDays < 3
                                ? "bg-[#FF6B6B]"
                                : "bg-[#D4FF47]"
                            }`}
                          />
                          <span
                            className={`text-[10px] font-bold ${
                              item.expiryDays < 3
                                ? "text-[#FF6B6B]"
                                : "text-gray-400"
                            }`}
                          >
                            {item.expiryDays} days left
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                {/* ... (Add Item Form Content from previous response remains mostly the same, maybe ensure numeric inputs allow decimals) ... */}
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
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">{configuringFood.image || "🍎"}</span>
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
                                        step="0.01" // Allow decimals
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
                        {/* ... rest of Add form (expiry, cost) ... */}
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
                            className="w-full bg-[#0A3323] text-[#D4FF47] py-4 rounded-xl font-bold text-lg hover:bg-[#0F4D34] transition-colors mt-4"
                        >
                            Confirm & Add
                        </button>
                    </div>
                ) : (
                     // ... Search List View (same as before) ...
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
                                    <span className="text-2xl">{food.image || "🍎"}</span>
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

        {/* --- CONSUME / WASTE ACTION MODAL --- */}
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
                                className={`flex-1 py-3 rounded-xl font-bold text-white 
                                    ${actionForm.type === 'CONSUME' ? 'bg-[#0A3323]' : 'bg-[#FF6B6B]'}
                                `}
                            >
                                Confirm
                            </button>
                         </div>
                    </motion.div>
                </div>
            )}
         </AnimatePresence>


        {/* --- ITEM DETAILS MODAL (Updated) --- */}
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
                  <div className="w-24 h-24 bg-[#F3F6F4] rounded-full flex items-center justify-center text-5xl mb-4">
                    {selectedItem.image || "📦"}
                  </div>
                  <h3 className="text-3xl font-serif text-[#0A3323]">
                    {selectedItem.name}
                  </h3>
                  <span className="px-3 py-1 bg-[#E8F5E9] text-[#0A3323] text-xs font-bold rounded-full mt-2">
                    {selectedItem.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   {/* ... Expiry/Cost cards same as before ... */}
                   <div className="p-4 bg-[#F3F6F4] rounded-2xl">
                    <div className="flex items-center gap-2 text-gray-500 mb-1 text-xs uppercase font-bold">
                      <Calendar size={14} /> Expiry
                    </div>
                    <p
                      className={`text-xl font-bold ${
                        selectedItem.expiryDays < 3
                          ? "text-[#FF6B6B]"
                          : "text-[#0A3323]"
                      }`}
                    >
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
                        className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200"
                    >
                        <Trash2 size={18} /> Delete
                    </button>
                  </div>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-4">
                    Use "Delete" only for accidental entries. Use "Record Waste" to track expired food.
                </p>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}