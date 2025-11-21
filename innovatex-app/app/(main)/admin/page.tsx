"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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
    imageUrl: "🍎" // Default emoji
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          imageUrl: "🍎"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg font-semibold text-gray-600">Loading Admin Panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">🛡️ SuperAdmin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage platform overview and database.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium shadow-md flex items-center gap-2"
          >
            {showForm ? "Cancel" : "➕ Add Food Item"}
          </button>
        </div>

        {/* ADD ITEM FORM (Collapsible) */}
        {showForm && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 mb-8 animate-in fade-in slide-in-from-top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Add New Global Food Item</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input 
                  type="text" name="name" required
                  value={formData.name} onChange={handleInputChange}
                  placeholder="e.g., Quinoa"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categories (comma separated)</label>
                <input 
                  type="text" name="category" required
                  value={formData.category} onChange={handleInputChange}
                  placeholder="e.g., Grain, Superfood"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typical Expiry (Days)</label>
                <input 
                  type="number" name="typicalExpiryDays" required min="1"
                  value={formData.typicalExpiryDays} onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (Tk)</label>
                  <input 
                    type="number" name="costPerUnit" required min="0"
                    value={formData.costPerUnit} onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select 
                    name="unit" 
                    value={formData.unit} onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon / Emoji</label>
                <input 
                  type="text" name="imageUrl"
                  value={formData.imageUrl} onChange={handleInputChange}
                  placeholder="e.g., 🥣 or https://..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 flex justify-end mt-2">
                <button 
                  type="submit" disabled={submitting}
                  className="bg-green-600 text-white px-8 py-2 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Item"}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Total Users</h3>
            <p className="text-5xl font-extrabold text-indigo-600 mt-3">{stats.stats.totalUsers}</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Food Database Items</h3>
            <p className="text-5xl font-extrabold text-orange-600 mt-3">{stats.stats.totalFoods}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Foods Table */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">🔥 Most Consumed Foods</h2>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                  <tr>
                    <th className="p-4">Item Name</th>
                    <th className="p-4 text-right">Times Consumed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.popularFoods.length > 0 ? (
                    stats.popularFoods.map((food: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-medium text-gray-900">{food._id}</td>
                        <td className="p-4 text-right font-semibold text-green-600">{food.count}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-gray-400">No data yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">👥 Newest Users</h2>
            <div className="space-y-4">
              {stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any) => (
                  <div key={user._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-100">
                    <img 
                      src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      alt="Avatar" 
                      className="w-10 h-10 rounded-full bg-gray-200 border border-gray-200"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="ml-auto text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-md">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-4">No users found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}