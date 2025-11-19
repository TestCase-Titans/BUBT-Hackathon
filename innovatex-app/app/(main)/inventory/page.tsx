'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Check, Clock, X } from 'lucide-react';
import { THEME } from '@/lib/theme';
import { useApp } from '@/context/AppContext';
import PageWrapper from '@/components/PageWrapper';

export default function InventoryPage() {
  const { inventory, setInventory } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'General',
    quantity: 1,
    unit: 'pcs',
    expiryDays: 7
  });

  const CATEGORIES = ["General", "Dairy", "Vegetable", "Fruit", "Grain", "Protein", "Canned"];

  // Filter Logic
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  const displayedItems = safeInventory.filter((item: any) => {
      if (activeTab === 'active') return item.status === 'ACTIVE';
      return item.status === 'CONSUMED' || item.status === 'WASTED';
  });

  const handleAddItem = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          // Calculate approx date for backend
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + newItem.expiryDays);

          const res = await fetch('/api/inventory', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...newItem,
                  expirationDate: expirationDate.toISOString()
              })
          });

          if (res.ok) {
            const savedItem = await res.json();
            // Optimistic update needs formatting to match GET format
            const formattedItem = {
                ...savedItem,
                id: savedItem._id,
                expiryDays: newItem.expiryDays,
                image: "📦"
            };
            setInventory([...safeInventory, formattedItem]);
            setShowAddForm(false);
            setNewItem({ name: '', category: 'General', quantity: 1, unit: 'pcs', expiryDays: 7 });
          }
      } catch (error) {
          console.error("Failed to add item", error);
      }
  };

  const handleDelete = async (id: string) => {
     try {
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        setInventory(safeInventory.filter((i: any) => i.id !== id));
     } catch (error) { console.error("Failed to delete", error); }
  };

  const handleConsume = async (id: string) => {
    try {
       await fetch(`/api/inventory/${id}`, { 
           method: 'PATCH',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ status: 'CONSUMED' })
       });
       // Update local state to move it to history
       setInventory(safeInventory.map((i: any) => 
           i.id === id ? { ...i, status: 'CONSUMED' } : i
       ));
    } catch (error) { console.error("Failed to update", error); }
 };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 h-full flex flex-col max-w-7xl mx-auto">
        
        {/* Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
           <div>
                <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
                    {activeTab === 'active' ? 'My Pantry' : 'Consumption History'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    {activeTab === 'active' ? 'Manage your current stock' : 'Track what you have used'}
                </p>
           </div>

           <div className="flex items-center gap-3">
               {/* Tabs */}
               <div className="bg-white p-1 rounded-full shadow-sm flex">
                   <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-[#0A3323] text-[#D4FF47]' : 'text-gray-500'}`}
                   >
                    Active
                   </button>
                   <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-[#0A3323] text-[#D4FF47]' : 'text-gray-500'}`}
                   >
                    History
                   </button>
               </div>

               {/* Add Button */}
               {activeTab === 'active' && (
                   <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#D4FF47] hover:bg-[#b6e028] text-[#0A3323] p-3 rounded-full shadow-md transition-transform hover:scale-105"
                   >
                       <Plus size={24} />
                   </button>
               )}
           </div>
        </div>

        {/* Add Item Form (Modal-ish) */}
        <AnimatePresence>
            {showAddForm && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 overflow-hidden"
                >
                    <form onSubmit={handleAddItem} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 grid grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                        <div className="col-span-2 lg:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Item Name</label>
                            <input required type="text" placeholder="e.g., Milk" className="w-full p-3 bg-[#F3F6F4] rounded-xl outline-none focus:ring-2 ring-[#0A3323]/20" 
                                value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                             <select className="w-full p-3 bg-[#F3F6F4] rounded-xl outline-none"
                                value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                             >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                        </div>
                        <div className="space-y-1">
                             <label className="text-xs font-bold text-gray-500 uppercase">Qty</label>
                             <div className="flex">
                                <input type="number" className="w-1/2 p-3 bg-[#F3F6F4] rounded-l-xl outline-none" placeholder="1" 
                                    value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                                />
                                <input type="text" className="w-1/2 p-3 bg-[#F3F6F4] rounded-r-xl outline-none border-l border-gray-200" placeholder="unit" 
                                    value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}
                                />
                             </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Expiry (Days)</label>
                            <input type="number" className="w-full p-3 bg-[#F3F6F4] rounded-xl outline-none" placeholder="7" 
                                value={newItem.expiryDays} onChange={e => setNewItem({...newItem, expiryDays: parseInt(e.target.value)})}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 p-3 bg-gray-100 rounded-xl text-gray-500 font-bold hover:bg-gray-200">Cancel</button>
                            <button type="submit" className="flex-1 p-3 bg-[#0A3323] text-white rounded-xl font-bold hover:bg-[#0f4530]">Add</button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Inventory List */}
        <div className="overflow-y-auto flex-1 lg:pr-2 pb-24">
          {displayedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
              <p>{activeTab === 'active' ? 'Your pantry is empty.' : 'No history yet.'}</p>
              {activeTab === 'active' && <p className="text-xs mt-2">Try adding items manually or scan a receipt.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                {displayedItems.map((item: any) => (
                    <motion.div
                    key={item.id || item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`${THEME.glass} p-4 rounded-2xl flex items-center gap-4 group hover:shadow-md transition-all border-l-4 ${
                        activeTab === 'history' ? 'border-l-gray-300 opacity-60' :
                        item.expiryDays < 3 ? 'border-l-[#FF6B6B]' : 'border-l-transparent'
                    }`}
                    >
                    <div className="w-14 h-14 rounded-2xl bg-[#F3F6F4] text-3xl flex items-center justify-center flex-shrink-0">
                        {item.image || "📦"} 
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-[#0A3323] truncate pr-2">{item.name}</h3>
                            <span className="text-xs text-gray-400 font-mono bg-white px-2 py-0.5 rounded-md whitespace-nowrap">
                                {item.quantity} {item.unit}
                            </span>
                        </div>
                        
                        {activeTab === 'active' && (
                            <>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${
                                            item.expiryDays < 3 ? 'bg-[#FF6B6B]' : 
                                            item.expiryDays < 7 ? 'bg-yellow-400' : 'bg-[#D4FF47]'
                                        }`} 
                                        style={{ width: `${Math.min(100, ((item.expiryDays || 14) / 14) * 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{item.category}</span>
                                    <span className={`text-[10px] font-bold ${item.expiryDays < 3 ? 'text-[#FF6B6B]' : 'text-gray-400'}`}>
                                        {item.expiryDays} days left
                                    </span>
                                </div>
                            </>
                        )}
                        {activeTab === 'history' && (
                            <div className="flex gap-2 mt-2">
                                <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-bold">Consumed</span>
                                <span className="text-[10px] text-gray-400 self-center uppercase">{item.category}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {activeTab === 'active' && (
                             <button 
                                onClick={() => handleConsume(item.id || item._id)}
                                className="p-2 rounded-full bg-[#D4FF47] text-[#0A3323] hover:bg-[#b6e028] shadow-sm"
                                title="Mark as Consumed"
                             >
                                <Check size={16} />
                             </button>
                        )}
                        <button 
                            onClick={() => handleDelete(item.id || item._id)}
                            className="p-2 rounded-full bg-white text-gray-400 hover:text-[#FF6B6B] hover:bg-red-50 border border-gray-100 shadow-sm"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}