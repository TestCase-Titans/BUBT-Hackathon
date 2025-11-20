'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, Droplet, Sun, Wind, ArrowRight, Plus, AlertCircle, Loader2, Coins, TrendingDown, TrendingUp } from 'lucide-react';
import { THEME } from '@/lib/theme';
import { useApp } from '@/context/AppContext';
import PageWrapper from '@/components/PageWrapper';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { inventory, user } = useApp();
  const safeInventory = Array.isArray(inventory) ? inventory : [];
  
  const [stats, setStats] = useState({
    streak: 0,
    wasteSavedUnits: "0", // Matches API key
    moneySaved: 0,
    impactScore: 0,
    inventoryCount: 0,
    moneyWasted: 0, 
    pantryValue: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch('/api/dashboard');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to load dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };

    fetchStats();
  }, []);

  const expiringItems = safeInventory.filter((i: any) => i.expiryDays < 3);

  return (
    <PageWrapper>
       <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-7xl mx-auto">
         <header className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
                Good Morning, {user?.name?.split(' ')[0] || 'Chef'}
              </h2>
              <p className="text-gray-500 lg:text-lg">Let's keep the cycle going.</p>
            </div>
            <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm">
                <span className="text-sm font-bold text-[#0A3323]">Dhaka, Bangladesh</span>
                <Sun size={18} className="text-yellow-500" />
            </div>
         </header>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
       
            <div className="lg:col-span-2 space-y-6">
               
                {/* --- MAIN IMPACT CARD --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full p-6 lg:p-10 rounded-3xl bg-[#0A3323] text-[#F3F6F4] relative overflow-hidden"
                >
                    <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <p className="text-[#D4FF47] text-xs font-bold uppercase tracking-wider mb-1">Impact Score</p>
                        {loading ? (
                            <div className="h-12 w-32 bg-white/10 rounded animate-pulse mb-2" />
                        ) : (
                            <h3 className="text-4xl lg:text-5xl font-serif mb-2">
                                {stats.impactScore >= 80 ? 'Excellent' : stats.impactScore >= 50 ? 'Good' : 'Growing'}
                            </h3>
                        )}
                        <p className="text-sm text-gray-400 max-w-[200px] lg:max-w-md">
                            Based on your consumption vs. waste ratio. Keep consuming to boost your score!
                        </p>
                    </div>
                    
                    <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-[#D4FF47]/30 flex items-center justify-center relative flex-shrink-0">
                        {loading ? (
                            <Loader2 className="animate-spin text-[#D4FF47]" />
                        ) : (
                            <>
                                <div className="absolute inset-0 border-4 border-[#D4FF47] rounded-full border-l-transparent rotate-45 transition-all duration-1000" 
                                     style={{ transform: `rotate(${45 + (stats.impactScore * 3.6)}deg)`}}
                                ></div>
                                <span className="text-2xl lg:text-4xl font-bold text-[#D4FF47]">
                                    {stats.impactScore}
                                </span>
                            </>
                        )}
                    </div>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                        <Leaf size={250} />
                    </div>
                </motion.div>

                {/* --- FINANCIAL & STATS GRID (5 Columns on Large) --- */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
                    {/* 1. Items Tracked */}
                    <motion.div 
                        className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors`}
                    >
                        <Leaf size={20} className="text-[#0A3323] mb-2" />
                        {loading ? <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"/> : <span className="text-lg font-bold text-[#0A3323]">{stats.inventoryCount}</span>}
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Active</span>
                    </motion.div>

                    {/* 2. Pantry Value */}
                    <motion.div 
                        className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors`}
                    >
                        <Coins size={20} className="text-[#0A3323] mb-2" />
                        {loading ? <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"/> : <span className="text-lg font-bold text-[#0A3323]">৳{stats.pantryValue}</span>}
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Value</span>
                    </motion.div>

                     {/* 3. Saved Wastage (Money Saved) */}
                     <motion.div 
                        className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors border border-[#D4FF47]/30 bg-[#D4FF47]/5`}
                    >
                        <TrendingUp size={20} className="text-[#0A3323] mb-2" />
                        {loading ? <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"/> : <span className="text-lg font-bold text-[#0A3323]">৳{stats.moneySaved}</span>}
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Saved</span>
                    </motion.div>

                    {/* 4. Money Wasted */}
                    <motion.div 
                        className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors`}
                    >
                        <TrendingDown size={20} className="text-[#FF6B6B] mb-2" />
                        {loading ? <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"/> : <span className="text-lg font-bold text-[#FF6B6B]">৳{stats.moneyWasted}</span>}
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Wasted</span>
                    </motion.div>

                    {/* 5. Streak */}
                    <motion.div 
                        className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors`}
                    >
                        <Sun size={20} className="text-yellow-500 mb-2" />
                        <span className="text-lg font-bold text-[#0A3323]">{stats.streak}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold">Streak</span>
                    </motion.div>
                </div>
            </div>

            {/* --- SIDEBAR --- */}
            <div className="lg:col-span-1 space-y-6">
                {/* Daily Insight */}
                <div className="bg-[#E8F5E9] p-6 rounded-3xl border border-[#0A3323]/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                            <Wind size={20} className="text-[#0A3323]" />
                        </div>
                        <h3 className="font-serif text-lg text-[#0A3323]">Daily Insight</h3>
                    </div>
                    <p className="text-sm text-[#0A3323]/80 leading-relaxed mb-4">
                        "Store potatoes and onions separately. When kept together, they release gases that cause both to spoil faster."
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <Link href="/scan">
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-white p-6 rounded-3xl shadow-sm flex flex-col justify-between h-40 group relative overflow-hidden cursor-pointer"
                        >
                            <div className="relative z-10 w-full">
                                <div className="w-10 h-10 rounded-full bg-[#F3F6F4] flex items-center justify-center mb-3 group-hover:bg-[#D4FF47] transition-colors">
                                    <Plus size={20} className="text-[#0A3323]" />
                                </div>
                                <span className="text-lg font-bold text-[#0A3323] block text-left leading-tight">Quick Log</span>
                            </div>
                            <ArrowRight size={20} className="relative z-10 self-end text-gray-300 group-hover:text-[#0A3323] transition-colors" />
                        </motion.div>
                    </Link>

                    <Link href="/inventory">
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-[#FFEDED] p-6 rounded-3xl shadow-sm flex flex-col justify-between h-40 relative overflow-hidden cursor-pointer"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle size={16} className="text-[#FF6B6B]" />
                                    <span className="text-xs font-bold text-[#FF6B6B] uppercase">Action Needed</span>
                                </div>
                                <span className="text-2xl font-bold text-[#0A3323] block text-left">{expiringItems.length}</span>
                                <span className="text-sm text-[#0A3323]/70 block text-left leading-tight">Items expiring<br/>very soon</span>
                            </div>
                            <div className="text-xs font-bold underline text-left mt-2 relative z-10 text-[#FF6B6B]">View Pantry</div>
                        </motion.div>
                    </Link>
                </div>
            </div>
         </div>
       </div>
    </PageWrapper>
  );
}