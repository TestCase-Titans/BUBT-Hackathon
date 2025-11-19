'use client';
import { useState, useEffect } from 'react';
import { LogOut, ChevronRight, Save, X, Edit2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import PageWrapper from '@/components/PageWrapper';

export default function ProfilePage() {
  const { logout, user } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    householdSize: 1,
    dietaryPreferences: [] as string[],
    budgetRange: "Medium",
    location: ""
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfileData({
            name: data.name || "",
            email: data.email || "",
            householdSize: data.householdSize || 1,
            dietaryPreferences: data.dietaryPreferences || [],
            budgetRange: data.budgetRange || "Medium",
            location: data.location || ""
        });
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
        const res = await fetch('/api/user/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        if (res.ok) {
            setIsEditing(false);
            // Optional: Show toast success
        }
    } catch (error) {
        console.error("Failed to save", error);
    }
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading Profile...</div>;

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">My Profile</h2>
            {isEditing ? (
                <div className="flex gap-2">
                    <button onClick={() => setIsEditing(false)} className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"><X size={20}/></button>
                    <button onClick={handleSave} className="p-2 rounded-full bg-[#D4FF47] text-[#0A3323] hover:bg-[#b6e028]"><Save size={20}/></button>
                </div>
            ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-[#0A3323] hover:bg-gray-50">
                    <Edit2 size={16} /> Edit
                </button>
            )}
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-8 mb-8 border border-gray-100">
            <div className="w-24 h-24 rounded-full bg-[#D4FF47] text-[#0A3323] text-3xl font-bold flex items-center justify-center shadow-lg border-4 border-[#F3F6F4]">
                {profileData.name.charAt(0)}
            </div>
            <div className="text-center md:text-left flex-1 w-full">
                <h3 className="text-2xl font-bold text-[#0A3323]">{profileData.name}</h3>
                <p className="text-gray-500">{profileData.email}</p>
                <div className="flex gap-2 mt-4 justify-center md:justify-start flex-wrap">
                   {isEditing ? (
                        <input 
                            type="text" 
                            value={profileData.location}
                            onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                            className="px-3 py-1 border rounded-lg text-sm bg-[#F3F6F4]"
                            placeholder="Location"
                        />
                   ) : (
                        profileData.location && <span className="px-3 py-1 bg-[#E8F5E9] text-[#0A3323] text-xs font-bold rounded-full">{profileData.location}</span>
                   )}
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0A3323]">Preferences</h3>
              
              {/* Household Size */}
              <div className="bg-white p-5 rounded-2xl flex justify-between items-center border border-gray-100">
                  <span className="font-medium text-[#0A3323]">Household Size</span>
                  {isEditing ? (
                      <input 
                        type="number" 
                        min="1"
                        value={profileData.householdSize}
                        onChange={(e) => setProfileData({...profileData, householdSize: parseInt(e.target.value)})}
                        className="w-20 p-2 bg-[#F3F6F4] rounded-lg text-right font-bold"
                      />
                  ) : (
                      <span className="font-bold text-gray-500">{profileData.householdSize} Members</span>
                  )}
              </div>

              {/* Budget Range */}
              <div className="bg-white p-5 rounded-2xl flex justify-between items-center border border-gray-100">
                  <span className="font-medium text-[#0A3323]">Budget Range</span>
                  {isEditing ? (
                      <select 
                        value={profileData.budgetRange}
                        onChange={(e) => setProfileData({...profileData, budgetRange: e.target.value})}
                        className="p-2 bg-[#F3F6F4] rounded-lg font-bold text-sm"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                  ) : (
                      <span className="font-bold text-gray-500">{profileData.budgetRange}</span>
                  )}
              </div>

               {/* Dietary Prefs */}
               <div className="bg-white p-5 rounded-2xl flex flex-col gap-2 border border-gray-100">
                  <span className="font-medium text-[#0A3323]">Dietary Preference</span>
                  {isEditing ? (
                      <select 
                        value={profileData.dietaryPreferences[0] || "None"}
                        onChange={(e) => setProfileData({...profileData, dietaryPreferences: [e.target.value]})}
                        className="p-2 bg-[#F3F6F4] rounded-lg font-bold text-sm w-full mt-2"
                      >
                        <option value="None">None</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Halal">Halal</option>
                        <option value="Keto">Keto</option>
                      </select>
                  ) : (
                      <span className="font-bold text-gray-500 mt-1">{profileData.dietaryPreferences[0] || "None"}</span>
                  )}
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0A3323]">Account</h3>
              {['Notifications', 'Export Data', 'Privacy Policy'].map(item => (
                  <button key={item} className="w-full bg-white p-5 rounded-2xl flex justify-between items-center text-[#0A3323] hover:bg-gray-50 transition-colors group border border-gray-100">
                      {item}
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0A3323]" />
                  </button>
              ))}
           </div>
        </div>

        <button 
          onClick={logout}
          className="w-full mt-12 p-4 rounded-2xl border-2 border-[#FF6B6B] text-[#FF6B6B] font-bold flex items-center justify-center gap-2 hover:bg-[#FF6B6B] hover:text-white transition-colors max-w-md mx-auto lg:mx-0"
        >
           <LogOut size={20} />
           Log Out
        </button>
      </div>
    </PageWrapper>
  );
}