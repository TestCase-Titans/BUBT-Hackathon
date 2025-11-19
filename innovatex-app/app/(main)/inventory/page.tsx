'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { THEME } from '@/lib/theme';
import { CATEGORIES } from '@/lib/data';
import { useApp } from '@/context/AppContext';
import PageWrapper from '@/components/PageWrapper';

export default function InventoryPage() {
  const { inventory, setInventory } = useApp();
  const [filter, setFilter] = useState('All');

  const filteredItems = filter === 'All' 
    ? inventory 
    : inventory.filter((item: any) => item.category === filter);

  const handleDelete = (id: number) => {
     setInventory(inventory.filter((i: any) => i.id !== id));
  };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 h-full flex flex-col max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
           <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">My Pantry</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
              {CATEGORIES.map(cat => (
              <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  filter === cat 
                  ? 'bg-[#0A3323] text-[#D4FF47]' 
                  : 'bg-white text-gray-500 hover:bg-white/80'
                  }`}
              >
                  {cat}
              </button>
              ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 lg:pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
              <AnimatePresence>
              {filteredItems.map((item: any) => (
                  <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`${THEME.glass} p-4 rounded-2xl flex items-center gap-4 group hover:shadow-md transition-all border-l-4 ${item.expiryDays < 3 ? 'border-l-[#FF6B6B]' : 'border-l-transparent'}`}
                  >
                  <div className="w-14 h-14 rounded-2xl bg-[#F3F6F4] text-3xl flex items-center justify-center flex-shrink-0">
                      {item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[#0A3323] truncate pr-2">{item.name}</h3>
                          <span className="text-xs text-gray-400 font-mono bg-white px-2 py-0.5 rounded-md whitespace-nowrap">{item.quantity} {item.unit}</span>
                      </div>
                      
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                          className={`h-full rounded-full ${
                              item.expiryDays < 3 ? 'bg-[#FF6B6B]' : 
                              item.expiryDays < 7 ? 'bg-yellow-400' : 'bg-[#D4FF47]'
                          }`} 
                          style={{ width: `${Math.min(100, (item.expiryDays / 14) * 100)}%` }}
                      />
                      </div>
                      <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wide">{item.category}</span>
                          <span className={`text-[10px] font-bold ${item.expiryDays < 3 ? 'text-[#FF6B6B]' : 'text-gray-400'}`}>
                              {item.expiryDays} days left
                          </span>
                      </div>
                  </div>
                  
                  <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-full text-gray-300 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-colors opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 opacity-100"
                  >
                      <Trash2 size={18} />
                  </button>
                  </motion.div>
              ))}
              </AnimatePresence>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}