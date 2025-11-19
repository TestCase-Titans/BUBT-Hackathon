"use client";
import type { ReactNode } from "react";
import { DashboardNavbar } from "@/components/DashboardNavbar"; // Import the new Navbar
import { MobileNavigation } from "@/components/MobileDock";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full relative bg-[var(--background)] text-[var(--foreground)]">
      
      {/* Top Navbar (Desktop) */}
      <DashboardNavbar />

      {/* Main Content Area 
          - Removed lg:pl-64 (sidebar offset)
          - Added pt-24 (to push content below fixed navbar)
      */}
      <main className="w-full pt-24 pb-8 min-h-screen">
        {children}
        
        {/* Spacer for Mobile Dock */}
        <div className="h-24 lg:hidden"></div>
      </main>

      {/* Bottom Dock (Mobile Only) */}
      <MobileNavigation />
    </div>
  );
}