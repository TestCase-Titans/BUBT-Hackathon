'use client';
import { DesktopSidebar } from '@/components/Navigation';
import { MobileNavigation } from '@/components/MobileDock';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full relative">
      <DesktopSidebar />
      <main className="flex-1 h-screen overflow-y-auto no-scrollbar lg:pl-64 w-full">
        {children}
      
        <div className="h-24 lg:hidden"></div>
      </main>
      <MobileNavigation />
    </div>
  );
}