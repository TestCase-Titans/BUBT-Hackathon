"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wheat,
  Sun,
  Wind,
  ArrowRight,
  Plus,
  AlertCircle,
  Loader2,
  Coins,
  TrendingDown,
  TrendingUp,
  Activity,
  MapPin,
  Sparkles,
} from "lucide-react";
import { THEME } from "@/lib/theme";
import { useApp } from "@/context/AppContext";
import PageWrapper from "@/components/PageWrapper";
import { useEffect, useState, useRef } from "react";
import { useNotification } from "@/context/NotificationContext";

export default function DashboardPage() {
  const { inventory, user } = useApp();
  const { notify } = useNotification();

  const safeInventory = Array.isArray(inventory) ? inventory : [];

  const hasWelcomed = useRef(false);
  const hasWarned = useRef(false);

  const [stats, setStats] = useState({
    streak: 0,
    wasteSavedUnits: "0",
    moneySaved: 0,
    impactScore: 0,
    inventoryCount: 0,
    moneyWasted: 0,
    pantryValue: 0,
    recentLogs: [] as any[],
    weeklyInsight: "Analyzing your habits...",
  });
  const [loading, setLoading] = useState(true);

  const [locationName, setLocationName] = useState("Locating...");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (user && !hasWelcomed.current) {
      const firstName = user.name?.split(" ")[0] || "Chef";
      notify(`Welcome back, ${firstName}! Let's save some food.`, "success");
      hasWelcomed.current = true;
    }
  }, [user, notify]);

  useEffect(() => {
    const expiringItemsCount = safeInventory.filter(
      (i: any) => i.expiryDays < 3
    ).length;
    if (expiringItemsCount > 0 && !hasWarned.current) {
      setTimeout(() => {
        notify(
          `Alert: You have ${expiringItemsCount} items expiring soon!`,
          "warning"
        );
      }, 1500);
      hasWarned.current = true;
    }
  }, [safeInventory, notify]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            if (res.ok) {
              const data = await res.json();
              const city =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state;
              const country = data.address.country;
              setLocationName(`${city}, ${country}`);
            }
          } catch (error) {
            console.error("Failed to fetch location name", error);
            setLocationName("Location Unavailable");
          }
        },
        (error) => {
          console.error("Geolocation error", error);
          setLocationName("Location Access Denied");
        }
      );
    } else {
      setLocationName("Geolocation Not Supported");
    }
  }, []);

  const expiringItems = safeInventory.filter((i: any) => i.expiryDays < 3);

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-7xl mx-auto">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
              Good Morning, {user?.name?.split(" ")[0] || "Chef"}
            </h2>
            <p className="text-gray-500 lg:text-lg">
              Let's keep the cycle going.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-[#0A3323]">
              {locationName}
            </span>
            <Sun size={18} className="text-yellow-500" />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* --- MAIN IMPACT CARD (FIXED: Not fully clickable) --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-6 lg:p-10 rounded-3xl bg-[#0A3323] text-[#F3F6F4] relative overflow-hidden group"
            >
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <p className="text-[#D4FF47] text-xs font-bold uppercase tracking-wider mb-1">
                    Personal SDG Score
                  </p>
                  {loading ? (
                    <div className="h-12 w-32 bg-white/10 rounded animate-pulse mb-2" />
                  ) : (
                    <h3 className="text-4xl lg:text-5xl font-serif mb-2">
                      {stats.impactScore >= 80
                        ? "Excellent"
                        : stats.impactScore >= 50
                        ? "Good"
                        : "Growing"}
                    </h3>
                  )}

                  {/* --- FIX: Inline Link Here --- */}
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">
                      Score: {stats.impactScore}/100
                    </p>
                    <Link
                      href="/ranklist"
                      className="inline-flex items-center gap-2 text-[#D4FF47] font-bold hover:underline text-sm"
                    >
                      See my Global Rank <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full border-4 border-[#D4FF47]/30 flex items-center justify-center relative flex-shrink-0">
                  {loading ? (
                    <Loader2 className="animate-spin text-[#D4FF47]" />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0 border-4 border-[#D4FF47] rounded-full border-l-transparent rotate-45 transition-all duration-1000"
                        style={{
                          transform: `rotate(${
                            45 + stats.impactScore * 3.6
                          }deg)`,
                        }}
                      ></div>
                      <span className="text-2xl lg:text-4xl font-bold text-[#D4FF47]">
                        {stats.impactScore}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                <Wheat size={250} />
              </div>
            </motion.div>

            {/* --- FINANCIAL & STATS GRID --- */}
            <div className="space-y-3 lg:space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4">
                <motion.div
                  className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors`}
                >
                  <Wheat size={20} className="text-[#0A3323] mb-2" />
                  {loading ? (
                    <div className="h-6 w-8 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <span className="text-lg font-bold text-[#0A3323]">
                      {stats.inventoryCount}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 uppercase font-bold">
                    Active
                  </span>
                </motion.div>

                <motion.div
                  className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors`}
                >
                  <Coins size={20} className="text-[#0A3323] mb-2" />
                  {loading ? (
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <span className="text-lg font-bold text-[#0A3323]">
                      ৳{stats.pantryValue}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 uppercase font-bold">
                    Value
                  </span>
                </motion.div>

                <motion.div
                  className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors col-span-2 md:col-span-1`}
                >
                  <Sun size={20} className="text-yellow-500 mb-2" />
                  <span className="text-lg font-bold text-[#0A3323]">
                    {stats.streak}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold">
                    Streak
                  </span>
                </motion.div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <motion.div
                  className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors border border-[#D4FF47]/30 bg-[#D4FF47]/5`}
                >
                  <TrendingUp size={20} className="text-[#0A3323] mb-2" />
                  {loading ? (
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <span className="text-lg font-bold text-[#0A3323]">
                      ৳{stats.moneySaved}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 uppercase font-bold">
                    Saved
                  </span>
                </motion.div>

                <motion.div
                  className={`${THEME.glass} p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white transition-colors`}
                >
                  <TrendingDown size={20} className="text-[#FF6B6B] mb-2" />
                  {loading ? (
                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                  ) : (
                    <span className="text-lg font-bold text-[#FF6B6B]">
                      ৳{stats.moneyWasted}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 uppercase font-bold">
                    Wasted
                  </span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              {/* WEEKLY INSIGHT */}
              <div className="bg-[#E8F5E9] p-6 rounded-3xl border border-[#0A3323]/5 lg:col-span-1 col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4FF47] opacity-10 rounded-full blur-2xl -translate-y-10 translate-x-10"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Sparkles size={20} className="text-[#0A3323]" />
                  </div>
                  <h3 className="font-serif text-lg text-[#0A3323]">
                    Weekly Insight
                  </h3>
                </div>
                <p className="text-sm text-[#0A3323]/80 leading-relaxed mb-4 relative z-10 italic">
                  "{loading ? "Generating insights..." : stats.weeklyInsight}"
                </p>
              </div>

              <Link href="/inventory">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#FFEDED] p-6 rounded-3xl shadow-sm flex flex-col justify-between h-40 relative overflow-hidden cursor-pointer"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={16} className="text-[#FF6B6B]" />
                      <span className="text-xs font-bold text-[#FF6B6B] uppercase">
                        Action Needed
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-[#0A3323] block text-left">
                      {expiringItems.length}
                    </span>
                    <span className="text-sm text-[#0A3323]/70 block text-left leading-tight">
                      Items expiring
                      <br />
                      very soon
                    </span>
                  </div>
                  <div className="text-xs font-bold underline text-left mt-2 relative z-10 text-[#FF6B6B]">
                    View Pantry
                  </div>
                </motion.div>
              </Link>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Activity size={18} className="text-[#0A3323]" />
                <h3 className="font-serif text-lg text-[#0A3323]">
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-4">
                {stats.recentLogs && stats.recentLogs.length > 0 ? (
                  stats.recentLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-bold text-[#0A3323]">{log.item}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(log.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-gray-50 text-gray-600">
                        {log.action} {log.quantity} {log.unit}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No recent activity.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
