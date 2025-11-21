"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Plus,
  X,
  Save,
  Users,
  Database,
  TrendingUp,
  Flame,
  Loader2,
} from "lucide-react";
import PageWrapper from "@/components/PageWrapper";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "", // Comma separated
    typicalExpiryDays: 7,
    costPerUnit: 0,
    unit: "kg",
    imageUrl: "🍎", // Default emoji
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      if (!(session?.user as any).isAdmin) {
        router.push("/dashboard");
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const json = await res.json();
        setStats(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("✅ Item Added Successfully!");
        setFormData({
          name: "",
          category: "",
          typicalExpiryDays: 7,
          costPerUnit: 0,
          unit: "kg",
          imageUrl: "🍎",
        });
        setShowForm(false);
        fetchStats(); // Refresh stats to show updated counts
      } else {
        const err = await res.json();
        alert(`❌ Error: ${err.error}`);
      }
    } catch (error) {
      alert("Failed to connect to server.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FFF4]">
        <div className="flex items-center gap-2 text-[#0A3323] font-serif text-xl">
          <Loader2 className="animate-spin" />
          Loading Admin Panel...
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Shield size={32} className="text-[#0A3323]" />
              <h1 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
                Super-Admin Dashboard
              </h1>
            </div>
            <p className="text-[#0A3323]/60 lg:text-lg">
              Manage platform overview and database.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-full font-bold shadow-sm flex items-center gap-2 transition-colors ${
              showForm
                ? "bg-white text-[#FF6B6B] border border-[#FF6B6B]"
                : "bg-[#0A3323] text-[#D4FF47]"
            }`}
          >
            {showForm ? (
              <>
                <X size={18} /> Cancel
              </>
            ) : (
              <>
                <Plus size={18} /> Add Food Item
              </>
            )}
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A3323] p-8 rounded-3xl text-[#F3F6F4] relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Users className="text-[#D4FF47]" size={24} />
                <h3 className="text-[#D4FF47] text-sm font-bold uppercase tracking-wider">
                  Total Users
                </h3>
              </div>
              <p className="text-5xl font-serif mt-3">
                {stats.stats.totalUsers}
              </p>
            </div>
            <Users
              size={120}
              className="absolute -bottom-4 -right-4 text-white/5"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <Database className="text-[#0A3323]" size={24} />
                <h3 className="text-[#0A3323]/60 text-sm font-bold uppercase tracking-wider">
                  Food Database
                </h3>
              </div>
              <p className="text-5xl font-serif text-[#0A3323] mt-3">
                {stats.stats.totalFoods}
              </p>
            </div>
            <Database
              size={120}
              className="absolute -bottom-4 -right-4 text-[#0A3323]/5"
            />
          </motion.div>
        </div>

        {/* ADD ITEM FORM (Collapsible) */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-[#0A3323]/10">
                <h2 className="text-xl font-serif font-bold text-[#0A3323] mb-6 pb-4 border-b border-gray-100">
                  Add New Global Food Item
                </h2>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-[#0A3323] mb-2">
                      Item Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Quinoa"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A3323] focus:border-[#0A3323] outline-none transition bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0A3323] mb-2">
                      Categories (comma separated)
                    </label>
                    <input
                      type="text"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="e.g., Grain, Superfood"
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A3323] focus:border-[#0A3323] outline-none transition bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0A3323] mb-2">
                      Typical Expiry (Days)
                    </label>
                    <input
                      type="number"
                      name="typicalExpiryDays"
                      required
                      min="1"
                      value={formData.typicalExpiryDays}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A3323] focus:border-[#0A3323] outline-none transition bg-gray-50"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-[#0A3323] mb-2">
                        Cost per Unit (Tk)
                      </label>
                      <input
                        type="number"
                        name="costPerUnit"
                        required
                        min="0"
                        value={formData.costPerUnit}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A3323] focus:border-[#0A3323] outline-none transition bg-gray-50"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-bold text-[#0A3323] mb-2">
                        Unit
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A3323] focus:border-[#0A3323] outline-none transition bg-gray-50"
                      >
                        <option value="kg">kg</option>
                        <option value="pcs">pcs</option>
                        <option value="L">L</option>
                        <option value="pack">pack</option>
                        <option value="dozen">dozen</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0A3323] mb-2">
                      Icon / Emoji
                    </label>
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      placeholder="e.g., 🥣 or https://..."
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0A3323] focus:border-[#0A3323] outline-none transition bg-gray-50"
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting}
                      className="bg-[#0A3323] text-[#D4FF47] px-8 py-3 rounded-xl font-bold hover:bg-[#0A3323]/90 transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {submitting ? "Saving..." : "Save Item"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Foods Table */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Flame className="text-orange-500" size={24} />
              <h2 className="text-xl font-serif font-bold text-[#0A3323]">
                Most Consumed Foods
              </h2>
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F0FFF4] text-[#0A3323] uppercase text-xs font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Item Name</th>
                    <th className="p-4 text-right">Times Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.popularFoods.length > 0 ? (
                    stats.popularFoods.map((food: any, i: number) => (
                      <tr key={i} className="hover:bg-[#F0FFF4]/50 transition">
                        <td className="p-4 font-bold text-[#0A3323]">
                          {food._id}
                        </td>
                        <td className="p-4 text-right font-bold text-[#0A3323]">
                          {food.count}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="p-4 text-center text-gray-400 italic"
                      >
                        No data yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users List */}
          <div className="bg-white p-6 lg:p-8 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="text-[#0A3323]" size={24} />
              <h2 className="text-xl font-serif font-bold text-[#0A3323]">
                Newest Users
              </h2>
            </div>
            <div className="space-y-4">
              {stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any) => (
                  <div
                    key={user._id}
                    className="flex items-center gap-4 p-3 hover:bg-[#F0FFF4] rounded-2xl transition border border-transparent hover:border-[#D4FF47]/20"
                  >
                    <img
                      src={
                        user.image ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                      }
                      alt="Avatar"
                      className="w-10 h-10 rounded-full bg-white border border-gray-200"
                    />
                    <div>
                      <p className="font-bold text-[#0A3323] text-sm">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="ml-auto text-xs text-[#0A3323]/60 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4 italic">
                  No users found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
