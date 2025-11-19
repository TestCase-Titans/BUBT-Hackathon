'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, AlertCircle } from 'lucide-react';
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    householdSize: 1,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        // --- REGISTRATION FLOW ---
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            householdSize: formData.householdSize,
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Registration failed");
        }

        // If registration successful, sign them in automatically
        const loginRes = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (loginRes?.error) {
            router.push('/'); // Stay here if auto-login fails
        } else {
            router.push('/dashboard');
        }

      } else {
        // --- LOGIN FLOW ---
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
      {/* Left Side - Visual */}
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
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center p-8 lg:p-16 relative bg-[#F3F6F4]">
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
                        required={isRegister}
                        className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" 
                        placeholder="Jane Doe" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Household Size</label>
                    <input 
                        name="householdSize"
                        value={formData.householdSize}
                        onChange={handleChange}
                        type="number" 
                        min="1"
                        className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" 
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
                required
                className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" 
                placeholder="jane@example.com" 
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Password</label>
              <input 
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password" 
                required
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

          <div className="mt-6 text-center">
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