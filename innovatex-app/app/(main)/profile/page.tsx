"use client";

import { useState, useEffect } from "react";
import {
  LogOut,
  ChevronRight,
  Save,
  X,
  Edit2,
  Camera,
  Loader2,
  Users,
  Wallet,
  MapPin,
  Shield,
  FileText,
  HelpCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import PageWrapper from "@/components/PageWrapper";
import { useNotification } from "@/context/NotificationContext";
import { motion } from "framer-motion";
import { THEME } from "@/lib/theme";

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
  "Paleo",
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
  const { notify } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    image: "",
    householdSize: 1,
    dietaryPreferences: [],
    budgetRange: "Medium",
    location: "",
  });

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
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
            location: data.location || "",
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
    if (isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (res.ok) setIsEditing(false);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error?.message || "Image upload failed");

      const imageUrl = data.secure_url;
      const updateRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (updateRes.ok) {
        setProfileData((prev) => ({ ...prev, image: imageUrl }));
        notify("Profile picture updated!");
      }
    } catch (error) {
      console.error("Upload failed", error);
      notify("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const togglePreference = (pref: string) => {
    setProfileData((prev) => {
      const exists = prev.dietaryPreferences.includes(pref);
      return {
        ...prev,
        dietaryPreferences: exists
          ? prev.dietaryPreferences.filter((p) => p !== pref)
          : [...prev.dietaryPreferences, pref],
      };
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(profileData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `innovatex_profile_${profileData.name
      .replace(/\s+/g, "_")
      .toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify("Data exported successfully!");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0A3323]" size={32} />
      </div>
    );

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-7xl mx-auto">
        {/* Header & Actions */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323]">
              My Profile
            </h2>
            <p className="text-gray-500 lg:text-lg">
              Manage your account settings
            </p>
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="p-3 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <X size={20} />
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#D4FF47] text-[#0A3323] font-bold hover:bg-[#b6e028] disabled:opacity-50 transition-all shadow-lg shadow-[#D4FF47]/20"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-full font-bold text-[#0A3323] hover:bg-gray-50 transition-all shadow-sm"
            >
              <Edit2 size={16} /> <span>Edit Profile</span>
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* --- LEFT COLUMN: Identity & Key Stats --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Hero Identity Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full p-8 rounded-3xl bg-[#0A3323] text-[#F3F6F4] relative overflow-hidden flex flex-col md:flex-row items-center gap-8"
            >
              {/* Avatar */}
              <div className="relative group w-32 h-32 flex-shrink-0 z-10">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#D4FF47] shadow-2xl bg-white/10 flex items-center justify-center">
                  {profileData.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileData.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-[#D4FF47]">
                      {profileData.name
                        ? profileData.name.charAt(0).toUpperCase()
                        : "U"}
                    </span>
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20 backdrop-blur-sm">
                  {uploading ? (
                    <Loader2 className="text-white animate-spin" size={32} />
                  ) : (
                    <Camera className="text-white" size={28} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Info */}
              <div className="text-center md:text-left flex-1 z-10">
                <h3 className="text-3xl font-serif font-bold mb-1 text-white">
                  {profileData.name}
                </h3>
                <p className="text-[#F3F6F4]/60 mb-4">{profileData.email}</p>

                <div className="flex items-center justify-center md:justify-start gap-2 text-[#D4FF47]">
                  <MapPin size={18} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          location: e.target.value,
                        })
                      }
                      className="px-3 py-1 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-[#D4FF47]"
                      placeholder="Set Location"
                    />
                  ) : (
                    <span className="font-bold">
                      {profileData.location || "Location not set"}
                    </span>
                  )}
                </div>
              </div>

              {/* Decor BG */}
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10 rotate-12 pointer-events-none">
                <Users size={250} />
              </div>
            </motion.div>

            {/* 2. Stats Grid (Household & Budget) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Household Card */}
              <motion.div
                whileHover={{ y: -2 }}
                className={`${THEME.glass} p-6 rounded-3xl flex flex-col justify-center items-center text-center`}
              >
                <div className="bg-[#E8F5E9] p-3 rounded-full mb-3 text-[#0A3323]">
                  <Users size={24} />
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                  Household Size
                </span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={profileData.householdSize}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          householdSize: parseInt(e.target.value),
                        })
                      }
                      className="w-20 p-2 text-center bg-white border border-gray-200 rounded-xl font-bold text-2xl text-[#0A3323] focus:border-[#0A3323] outline-none"
                    />
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-[#0A3323]">
                    {profileData.householdSize}{" "}
                    <span className="text-sm text-gray-400 font-normal">
                      Members
                    </span>
                  </span>
                )}
              </motion.div>

              {/* Budget Card */}
              <motion.div
                whileHover={{ y: -2 }}
                className={`${THEME.glass} p-6 rounded-3xl flex flex-col justify-center items-center text-center`}
              >
                <div className="bg-[#FFF8E1] p-3 rounded-full mb-3 text-amber-600">
                  <Wallet size={24} />
                </div>
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                  Budget Range
                </span>
                {isEditing ? (
                  <select
                    value={profileData.budgetRange}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        budgetRange: e.target.value,
                      })
                    }
                    className="p-2 bg-white border border-gray-200 rounded-xl font-bold text-lg text-[#0A3323] outline-none focus:border-[#0A3323]"
                  >
                    <option value="Low">Low (Student)</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <span className="text-3xl font-bold text-[#0A3323]">
                    {profileData.budgetRange}
                  </span>
                )}
              </motion.div>
            </div>

            {/* 3. Dietary Preferences */}
            <motion.div className={`${THEME.glass} p-8 rounded-3xl`}>
              <h3 className="text-xl font-serif font-bold text-[#0A3323] mb-4 flex items-center gap-2">
                Dietary Preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {isEditing ? (
                  DIETARY_OPTIONS.map((option) => {
                    const isSelected =
                      profileData.dietaryPreferences.includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => togglePreference(option)}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all border-2 ${
                          isSelected
                            ? "bg-[#0A3323] text-[#D4FF47] border-[#0A3323]"
                            : "bg-white text-gray-500 border-gray-100 hover:border-[#0A3323] hover:text-[#0A3323]"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })
                ) : profileData.dietaryPreferences.length > 0 ? (
                  profileData.dietaryPreferences.map((pref) => (
                    <span
                      key={pref}
                      className="px-4 py-2 bg-[#0A3323]/5 text-[#0A3323] text-sm font-bold rounded-full border border-[#0A3323]/10"
                    >
                      {pref}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 italic">
                    No specific dietary preferences set.
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT COLUMN: Account Menu --- */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-full"
            >
              <h3 className="text-lg font-serif font-bold text-[#0A3323] mb-6 px-2">
                Account Settings
              </h3>

              <div className="space-y-3">
                {/* Export Data */}
                <button
                  onClick={handleExportData}
                  className="w-full p-4 rounded-2xl flex justify-between items-center text-[#0A3323] hover:bg-[#F3F6F4] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors text-gray-500 group-hover:text-[#0A3323]">
                      <FileText size={18} />
                    </div>
                    <span className="font-medium">Export Data</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-[#0A3323] transition-colors"
                  />
                </button>

                {/* Privacy Policy (External Link) */}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-4 rounded-2xl flex justify-between items-center text-[#0A3323] hover:bg-[#F3F6F4] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors text-gray-500 group-hover:text-[#0A3323]">
                      <Shield size={18} />
                    </div>
                    <span className="font-medium">Privacy Policy</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-[#0A3323] transition-colors"
                  />
                </a>

                {/* Help Center (External Link) */}
                <a
                  href="https://support.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-4 rounded-2xl flex justify-between items-center text-[#0A3323] hover:bg-[#F3F6F4] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition-colors text-gray-500 group-hover:text-[#0A3323]">
                      <HelpCircle size={18} />
                    </div>
                    <span className="font-medium">Help Center</span>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-300 group-hover:text-[#0A3323] transition-colors"
                  />
                </a>
              </div>

              <div className="my-6 border-t border-gray-100"></div>

              <button
                onClick={logout}
                className="w-full p-4 rounded-2xl border-2 border-[#FF6B6B]/10 bg-[#FF6B6B]/5 text-[#FF6B6B] font-bold flex items-center justify-center gap-2 hover:bg-[#FF6B6B] hover:text-white transition-all"
              >
                <LogOut size={20} />
                Log Out
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
