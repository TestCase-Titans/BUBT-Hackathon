'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AuthPage() {
  const { login } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      login({ email: "demo@example.com" });
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#F3F6F4]">
      {/* Left Side - Visual (Fixed Height for Desktop) */}
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

      {/* Right Side - Form (Full Height for Desktop) */}
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

          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Full Name</label>
                <input type="text" className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" placeholder="Jane Doe" />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Email</label>
              <input type="email" className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" placeholder="jane@example.com" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#0A3323] uppercase tracking-wider">Password</label>
              <input type="password" className="w-full p-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#0A3323]/20 outline-none transition-all" placeholder="••••••••" />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-[#0A3323] text-[#D4FF47] p-4 rounded-xl font-bold text-lg mt-6 hover:bg-[#0F4D34] transition-colors relative overflow-hidden"
            >
              {loading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsRegister(!isRegister)}
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