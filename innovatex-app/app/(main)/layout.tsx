"use client";
import type { ReactNode } from "react";
import { DashboardNavbar } from "@/components/DashboardNavbar";
import { MobileNavigation } from "@/components/MobileDock";
import { ChatFab } from "@/components/ChatFab"; // Import the new FAB

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full relative bg-[var(--background)] text-[var(--foreground)]">
      
      {/* Top Navbar (Desktop) */}
      <DashboardNavbar />

      {/* Floating Chat Button - Added Here */}
      <ChatFab />

      {/* Main Content Area */}
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