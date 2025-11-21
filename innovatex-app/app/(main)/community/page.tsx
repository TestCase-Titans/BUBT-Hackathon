"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  MapPin, 
  Clock, 
  Plus, 
  Loader2,
  Package,
  Trash2 // Import Trash Icon
} from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { useNotification } from "@/context/NotificationContext";
import { useApp } from "@/context/AppContext";

export default function CommunityPage() {
  const { inventory, user } = useApp(); 
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  
  // Modal States
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const { notify } = useNotification();

  // Load Real Data from DB
  useEffect(() => {
    fetch("/api/community")
      .then((res) => res.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleClaim = (itemName: string) => {
    notify(`Request sent for ${itemName}! The donor will contact you.`, "success");
  };

  // --- NEW: Remove your own item ---
  const handleRemove = (itemId: string) => {
    // For now, removing from UI. In real app, call DELETE API.
    setItems(items.filter(i => i.id !== itemId));
    notify("Item removed from listing.", "info");
  };

  const handlePostListing = async () => {
    if (!selectedItemId) {
        notify("Please select an item to donate.", "error");
        return;
    }

    setIsPosting(true);

    const itemToDonate = inventory.find((i: any) => i.id === selectedItemId);

    if (!itemToDonate) {
        notify("Item not found.", "error");
        setIsPosting(false);
        return;
    }

    // Prepare Payload
    const payload = {
        name: itemToDonate.name,
        donor: user?.name || "Me",
        distance: "0.1 km", 
        category: itemToDonate.category[0] || "General",
        quantity: itemToDonate.quantity,
        unit: itemToDonate.unit,
        image: itemToDonate.image || "📦",
    };

    try {
        const res = await fetch('/api/community', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            const savedItem = await res.json();
            
            const formattedItem = {
                id: savedItem._id, 
                ...payload,
                postedAt: "Just now",
                status: "AVAILABLE",
                donorId: user?.id // Important for identifying ownership immediately
            };

            setItems([formattedItem, ...items]);
            
            notify("Success! Your item is listed.", "success");
            setShowDonateModal(false);
            setSelectedItemId("");
        } else {
            notify("Failed to list item. Try again.", "error");
        }
    } catch (error) {
        console.error("Post error", error);
        notify("Network error. Please try again.", "error");
    } finally {
        setIsPosting(false);
    }
  };

  const filteredItems = filter === "All" 
    ? items 
    : items.filter(i => i.category === filter);

  const validPantryItems = Array.isArray(inventory) 
    ? inventory.filter((i: any) => i.status === 'ACTIVE' && i.quantity > 0)
    : [];

  // --- FIXED: Remove Duplicates for Dropdown ---
  // We use a Map to keep only the first item of each unique name
  const uniquePantryItems = Array.from(
    new Map(validPantryItems.map(item => [item.name, item])).values()
  );

  const renderItemImage = (src: string, alt: string, id: string) => {
    const isUrl = src && (src.startsWith("http") || src.startsWith("/"));

    if (isUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
                e.currentTarget.src = `https://picsum.photos/seed/${id}/400/300`;
                e.currentTarget.onerror = null; 
            }} 
        />
      );
    } else {
      return (
        <div className="w-full h-full bg-[#F3F6F4] flex items-center justify-center">
             <span className="text-6xl select-none">{src || "📦"}</span>
        </div>
      );
    }
  };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-2">
              Community Share
            </h2>
            <p className="text-gray-500">
              Discover surplus food from neighbors and reduce local waste.
            </p>
          </div>
          <button 
            onClick={() => setShowDonateModal(true)}
            className="bg-[#0A3323] text-[#D4FF47] px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-[#0F4D34] transition-colors shadow-lg"
          >
            <Plus size={20} /> Donate Food
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
            {["All", "Fruit", "Vegetable", "Canned", "Meat Protein", "General"].map(cat => (
                <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                        filter === cat 
                        ? "bg-[#0A3323] text-[#D4FF47] border-[#0A3323]" 
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#0A3323]"
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* Feed Grid */}
        {loading ? (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-[#0A3323]" size={32}/>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                {filteredItems.map((item) => {
                    // CHECK OWNERSHIP
                    const isOwner = user?.id && item.donorId === user.id;

                    return (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
                    >
                        <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 bg-gray-100">
                            {renderItemImage(item.image, item.name, item.id)}
                            
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#0A3323] flex items-center gap-1 z-10 shadow-sm">
                                <MapPin size={12} /> {item.distance}
                            </div>
                        </div>

                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-xl text-[#0A3323]">{item.name}</h3>
                                <p className="text-sm text-gray-500">{item.quantity} {item.unit} • {item.donor} {isOwner && "(You)"}</p>
                            </div>
                            <span className="px-2 py-1 bg-[#F3F6F4] text-[#0A3323] text-[10px] font-bold uppercase rounded-lg">
                                {item.category}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                            <Clock size={12} /> Posted {item.postedAt}
                        </div>

                        {/* CONDITIONAL BUTTON: REMOVE vs CLAIM */}
                        {isOwner ? (
                             <button 
                                onClick={() => handleRemove(item.id)}
                                className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={18} /> Remove Listing
                            </button>
                        ) : (
                            <button 
                                onClick={() => handleClaim(item.name)}
                                className="w-full py-3 bg-[#F3F6F4] text-[#0A3323] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#D4FF47] transition-colors group-hover:shadow-md"
                            >
                                <Heart size={18} className="text-[#0A3323]" /> Claim Item
                            </button>
                        )}
                    </motion.div>
                )})}
                </AnimatePresence>
            </div>
        )}

        {/* Donate Modal */}
        <AnimatePresence>
            {showDonateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white w-full max-w-md p-8 rounded-3xl text-center"
                    >
                        <div className="w-16 h-16 bg-[#D4FF47] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0A3323]">
                            <Heart size={32} />
                        </div>
                        <h3 className="text-2xl font-serif text-[#0A3323] mb-2">Share Food</h3>
                        <p className="text-gray-500 mb-6">Select an item from your pantry to share with neighbors.</p>
                        
                        <div className="mb-6 text-left">
                            <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider mb-2 block">Select Item</label>
                            <div className="relative">
                                <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <select 
                                    value={selectedItemId}
                                    onChange={(e) => setSelectedItemId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-[#0A3323] appearance-none"
                                >
                                    <option value="">-- Choose from Pantry --</option>
                                    {/* USE UNIQUE ITEMS HERE */}
                                    {uniquePantryItems.map((item: any) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} ({item.quantity} {item.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {validPantryItems.length === 0 && (
                                <p className="text-xs text-red-500 mt-2">Your pantry is empty! Add items first.</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowDonateModal(false)} 
                                className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handlePostListing}
                                disabled={isPosting || !selectedItemId}
                                className="flex-1 py-3 bg-[#0A3323] text-[#D4FF47] font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isPosting ? <Loader2 className="animate-spin" size={18} /> : "Post Listing"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}