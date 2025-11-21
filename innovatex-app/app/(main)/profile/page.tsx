'use client';

import { useState, useEffect } from 'react';
import { LogOut, ChevronRight, Save, X, Edit2, Camera, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import PageWrapper from '@/components/PageWrapper';
import { useNotification } from '@/context/NotificationContext';

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Keto",
  "Paleo"
];

interface ProfileData {
  name: string;
  email: string;
  image: string;
  householdSize: number;
  dietaryPreferences: string[];
  budgetRange: string;
  location: string;
}

export default function ProfilePage() {
  const { logout } = useApp();
  
  // State Management
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // <--- NEW STATE
  const { notify } = useNotification();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    image: "",
    householdSize: 1,
    dietaryPreferences: [],
    budgetRange: "Medium",
    location: ""
  });

  // Environment Variables
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (!data.error) {
          setProfileData({
            name: data.name || "",
            email: data.email || "",
            image: data.image || "",
            householdSize: data.householdSize || 1,
            dietaryPreferences: data.dietaryPreferences || [],
            budgetRange: data.budgetRange || "Medium",
            location: data.location || ""
          });
        }
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if(isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      notify("Cloudinary configuration missing in .env file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    try {
      // 1. Upload to Cloudinary
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || "Image upload failed");

      const imageUrl = data.secure_url;

      // 2. Update Database immediately with new image URL
      const updateRes = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }) 
      });

      if (updateRes.ok) {
        setProfileData((prev) => ({ ...prev, image: imageUrl }));
        notify("Profile picture updated!");
      } else {
        throw new Error("Database update failed");
      }
    } catch (error) {
      console.error("Upload failed", error);
      notify("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const togglePreference = (pref: string) => {
    setProfileData(prev => {
      const exists = prev.dietaryPreferences.includes(pref);
      let newPrefs;
      if (exists) {
        newPrefs = prev.dietaryPreferences.filter(p => p !== pref);
      } else {
        newPrefs = [...prev.dietaryPreferences, pref];
      }
      return { ...prev, dietaryPreferences: newPrefs };
    });
  };

  if (loading) return <div className="p-12 text-center text-gray-500">Loading Profile...</div>;

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">My Profile</h2>
            {isEditing ? (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsEditing(false)} 
                        disabled={isSaving}
                        className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50"
                    >
                        <X size={20}/>
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="p-2 rounded-full bg-[#D4FF47] text-[#0A3323] hover:bg-[#b6e028] disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-[#0A3323] hover:bg-gray-50">
                    <Edit2 size={16} /> Edit
                </button>
            )}
        </div>
        
        {/* Profile Header Card (Merged Image Upload + Info) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-8 mb-8 border border-gray-100">
            
            {/* Image Upload Section */}
            <div className="relative group w-32 h-32 flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#F3F6F4] shadow-lg bg-gray-100 flex items-center justify-center">
                    {profileData.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profileData.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[#D4FF47] text-[#0A3323] text-4xl font-bold flex items-center justify-center">
                            {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    )}
                </div>
                
                {/* Camera Overlay */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                    {uploading ? <Loader2 className="text-white animate-spin" size={32} /> : <Camera className="text-white" size={28} />}
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileUpload} disabled={uploading} />
                </label>
            </div>

            {/* User Details Section */}
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

        {/* Preferences Grid */}
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

               {/* Dietary Preferences */}
               <div className="bg-white p-5 rounded-2xl flex flex-col gap-3 border border-gray-100">
                  <span className="font-medium text-[#0A3323]">Dietary Preferences</span>
                  
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {DIETARY_OPTIONS.map(option => {
                        const isSelected = profileData.dietaryPreferences.includes(option);
                        return (
                          <button
                            key={option}
                            onClick={() => togglePreference(option)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                              isSelected 
                                ? 'bg-[#0A3323] text-[#D4FF47] border-[#0A3323]' 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-[#0A3323]'
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profileData.dietaryPreferences.length > 0 ? (
                        profileData.dietaryPreferences.map(pref => (
                          <span key={pref} className="px-3 py-1 bg-[#F3F6F4] text-[#0A3323] text-xs font-bold rounded-full border border-gray-200">
                            {pref}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400 italic">No preferences set</span>
                      )}
                    </div>
                  )}
              </div>
           </div>

           {/* Account Links */}
           <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0A3323]">Account</h3>
              {['Notifications', 'Export Data', 'Privacy Policy', 'Help Center'].map(item => (
                  <button key={item} className="w-full bg-white p-5 rounded-2xl flex justify-between items-center text-[#0A3323] hover:bg-gray-50 transition-colors group border border-gray-100">
                      {item}
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0A3323]" />
                  </button>
              ))}
           </div>
        </div>

        {/* Logout Button */}
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