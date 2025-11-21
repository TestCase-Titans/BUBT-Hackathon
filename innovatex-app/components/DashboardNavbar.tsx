"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import {
  Wheat,
  LayoutGrid,
  ScanLine,
  BookOpen,
  User,
  LogOut,
  BarChart3,
  Shield, // [NEW] Icon for Admin
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export const DashboardNavbar = () => {
  const pathname = usePathname();
  const { logout, user } = useApp(); // [NEW] Get user to check admin status

  const navItems = [
    {
      id: "dashboard",
      icon: LayoutGrid,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      id: "analytics",
      icon: BarChart3,
      label: "Analytics",
      path: "/analytics",
    },
    { id: "inventory", icon: Wheat, label: "My Pantry", path: "/inventory" },
    { id: "scan", icon: ScanLine, label: "Smart Scan", path: "/scan" },
    { id: "resources", icon: BookOpen, label: "Library", path: "/resources" },
    { id: "profile", icon: User, label: "Profile", path: "/profile" },
  ];

  // [NEW] Conditionally Add Admin Button
  if (user?.isAdmin) {
    navItems.push({
      id: "admin",
      icon: Shield,
      label: "Admin",
      path: "/admin",
    });
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-4 pb-2 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-7xl mx-auto relative group rounded-2xl">
        <div
          className="absolute inset-0 rounded-2xl 
                        /* Background Opacity */
                        bg-gradient-to-b from-white/60 to-white/30 dark:from-[#0A3323]/60 dark:to-[#051b12]/50
                        
                        /* The Blur */
                        backdrop-blur-2xl backdrop-saturate-150
                        
                        /* Borders & Shadows */
                        border-t border-white/60 dark:border-white/10
                        border-b border-white/10 dark:border-black/20
                        border-x border-white/20 dark:border-white/5
                        shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                        
                        z-0"
        />

        <div className="relative z-10 flex items-center justify-between px-6 py-3 transition-all duration-300">
          {/* Logo Area - Wrapped in Link for redirection */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4FF47] to-[#A0CC00] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4FF47]/20 ring-1 ring-white/50 dark:ring-black/20">
              <Wheat size={20} className="text-[#0A3323] drop-shadow-sm" />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-serif font-bold tracking-tight text-[#0A3323] dark:text-white leading-none drop-shadow-sm">
                Eco-Loop
              </h1>
            </div>
          </Link>

          {/* Radix Navigation Menu */}
          <NavigationMenu.Root className="relative hidden lg:flex items-center justify-center">
            <NavigationMenu.List
              className="flex items-center gap-1 p-1.5
                                            bg-black/5 dark:bg-black/20 
                                            rounded-full 
                                            border border-black/5 dark:border-white/5 
                                            shadow-inner"
            >
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.path);
                return (
                  <NavigationMenu.Item key={item.id}>
                    <NavigationMenu.Link asChild active={isActive}>
                      <Link
                        href={item.path}
                        className={`
                          group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 outline-none select-none
                          ${
                            isActive
                              ? "bg-[#0A3323] text-[#D4FF47] shadow-lg shadow-[#0A3323]/30 ring-1 ring-white/10 dark:bg-[#D4FF47] dark:text-[#0A3323] dark:shadow-[#D4FF47]/20"
                              : "text-slate-600 dark:text-slate-300 hover:text-[#0A3323] dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                          }
                        `}
                      >
                        <item.icon
                          size={18}
                          className={`transition-colors duration-300 ${
                            isActive
                              ? "text-[#D4FF47] dark:text-[#0A3323]"
                              : "text-slate-400 group-hover:text-[#0A3323] dark:group-hover:text-[#D4FF47]"
                          }`}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </NavigationMenu.Link>
                  </NavigationMenu.Item>
                );
              })}
            </NavigationMenu.List>
          </NavigationMenu.Root>

          <div className="flex items-center">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full
                         bg-gradient-to-b from-white/80 to-slate-50/50 dark:from-[#1a4d39]/80 dark:to-[#0A3323]/80
                         border border-slate-200 dark:border-[#D4FF47]/20
                         shadow-sm hover:shadow-md
                         text-slate-600 dark:text-slate-200 
                         hover:text-red-600 dark:hover:text-[#FF6B6B]
                         transition-all duration-300 text-sm font-bold"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};