// testcase-titans/bubt-hackathon/TestCase-Titans-BUBT-Hackathon-7f2fc8260090a6a6c6812ca1c49b4545799e53a2/innovatex-app/app/login/page.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Leaf, AlertCircle, ArrowLeft } from 'lucide-react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Updated state type for dietaryPreferences to be string[]
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    householdSize: 1,
    location: "",
    dietaryPreferences: [] as string[], 
    budgetRange: "Medium"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); 
  };

  // New helper for multi-select
  const togglePreference = (pref: string) => {
    setFormData(prev => {
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

  const validateForm = () => {
    if (!formData.email.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Invalid email format.";

    if (!formData.password) return "Password is required.";
    
    const password = formData.password;
    if (password.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
    if (!/[\W_]/.test(password)) return "Password must contain at least one special character (!@#$...).";

    if (isRegister) {
        if (!formData.name.trim()) return "Full name is required.";
        if (formData.householdSize < 1) return "Household size must be at least 1.";
        if (!formData.location.trim()) return "Location is required.";
    }

    return "";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
    }

    try {
      if (isRegister) {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            householdSize: formData.householdSize,
            location: formData.location,
            budgetRange: formData.budgetRange,
            dietaryPreferences: formData.dietaryPreferences // Now sending array directly
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Registration failed");
        }

        const loginRes = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (loginRes?.error) {
            router.push('/'); 
        } else {
            router.push('/dashboard');
        }

      } else {
        const result = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (result?.error) {
          throw new Error("Invalid email or password");
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#F3F6F4]">
      <div className="w-full lg:w-1/2 h-[40vh] lg:h-full relative overflow-hidden flex items-center justify-center bg-[#0A3323]">
        <div className="absolute inset-0 opacity-20">
            <motion.div 
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" 
            />
        </div>
        <div className="relative z-10 text-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-24 h-24 mx-auto bg-[#D4FF47] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(212,255,71,0.4)]">
               <Leaf size={48} className="text-[#0A3323]" />
            </div>
            <h1 className="text-5xl font-serif text-[#F3F6F4] mb-2">Eco-Loop</h1>
            <p className="text-[#D4FF47] font-mono text-sm tracking-widest uppercase">Food Management System</p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-8 lg:p-16 relative bg-[#F3F6F4] overflow-y-auto">
        
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 lg:top-10 lg:left-10 z-20">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-500 hover:text-[#0A3323] transition-colors font-bold text-xs uppercase tracking-widest group"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform text-[#0A3323]">
                 <ArrowLeft size={16} />
              </div>
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <h2 className="text-3xl font-serif text-[#0A3323] mb-2">
            {isRegister ? "Join the Cycle" : "Welcome Back"}
          </h2>
          <p className="text-gray-500 mb-8">
            {isRegister ? "Start your zero-waste journey today." : "Log in to manage your sustainable pantry."}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Full Name</label>
                    <input 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        type="text" 
                        className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" 
                        placeholder="Jane Doe" 
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Members</label>
                        <input 
                            name="householdSize"
                            value={formData.householdSize}
                            onChange={handleChange}
                            type="number" 
                            min="1"
                            className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" 
                        />
                    </div>
                    <div className="space-y-1">
                         <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Budget</label>
                         <select
                            name="budgetRange"
                            value={formData.budgetRange}
                            onChange={handleChange}
                            className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all"
                         >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                         </select>
                    </div>
                </div>

                {/* REPLACED: Multi-Select Dietary Preference */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Dietary Preference</label>
                    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl shadow-sm">
                      {DIETARY_OPTIONS.map(option => {
                        const isSelected = formData.dietaryPreferences.includes(option);
                        return (
                          <button
                            key={option}
                            type="button" // Prevent form submit
                            onClick={() => togglePreference(option)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                              isSelected 
                                ? 'bg-[#0A3323] text-[#D4FF47] border-[#0A3323]' 
                                : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Location</label>
                    <input 
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        type="text" 
                        className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" 
                        placeholder="e.g. Dhaka, Bangladesh" 
                    />
                </div>
              </>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Email</label>
              <input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email" 
                className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" 
                placeholder="jane@example.com" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">
                  Password {isRegister && <span className="text-[10px] text-gray-400 normal-case font-normal">(Min 8 chars, 1 upper, 1 lower, 1 special)</span>}
              </label>
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password" 
                className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[#0A3323] text-[#D4FF47] p-4 rounded-xl font-bold text-lg mt-6 hover:bg-[#0F4D34] transition-colors relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center pb-8 lg:pb-0">
            <button 
              onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
              }}
              type="button"
              className="text-[#0A3323] text-sm hover:underline font-medium"
            >
              {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}