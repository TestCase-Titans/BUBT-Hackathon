"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Wheat,
  LayoutGrid,
  ScanLine,
  BookOpen,
  User,
  Home,
  BarChart3,
  Shield, // [NEW] Icon
} from "lucide-react";
import { THEME } from "@/lib/theme";
import { useApp } from "@/context/AppContext"; // [NEW] Import Context

export const MobileNavigation = () => {
  const pathname = usePathname();
  const { user } = useApp(); // [NEW] Get User

  const navItems = [
    { id: "home", icon: Home, path: "/" },
    { id: "dashboard", icon: LayoutGrid, path: "/dashboard" },
    { id: "analytics", icon: BarChart3, path: "/analytics" },
    { id: "inventory", icon: Wheat, path: "/inventory" },
    { id: "scan", icon: ScanLine, path: "/scan" },
    { id: "resources", icon: BookOpen, path: "/resources" },
    { id: "profile", icon: User, path: "/profile" },
  ];

  // [NEW] Add Admin Link if admin
  if (user?.isAdmin) {
    navItems.push({ id: "admin", icon: Shield, path: "/admin" });
  }

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div
        className={`${THEME.glass} rounded-full p-2 flex justify-between items-center shadow-2xl overflow-x-auto no-scrollbar`}
      >
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? pathname === "/"
              : pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              href={item.path}
              className="relative p-3 rounded-full transition-colors duration-300 group flex-1 flex justify-center min-w-[44px]"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className={`absolute inset-0 ${THEME.primary} rounded-full`}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon
                size={24}
                className={`relative z-10 transition-colors duration-200 ${
                  isActive ? "text-[#D4FF47]" : "text-[#0A3323]/60"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};