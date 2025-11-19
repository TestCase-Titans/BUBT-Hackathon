'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Leaf, LayoutGrid, ScanLine, BookOpen, User, LogOut, Home } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const DesktopSidebar = () => {
  const pathname = usePathname();
  const { logout } = useApp();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/' }, 
    { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    { id: 'inventory', icon: Leaf, label: 'My Pantry', path: '/inventory' },
    { id: 'scan', icon: ScanLine, label: 'Smart Scan', path: '/scan' },
    { id: 'resources', icon: BookOpen, label: 'Library', path: '/resources' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 bg-[#0A3323] h-full fixed left-0 top-0 p-6 text-[#F3F6F4] shadow-xl z-40">
       <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 bg-[#D4FF47] rounded-full flex items-center justify-center">
             <Leaf size={20} className="text-[#0A3323]" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-wide">Eco-Loop</h1>
            <p className="text-[10px] text-[#D4FF47] uppercase tracking-wider">Sustainability OS</p>
          </div>
       </div>

       <nav className="flex-1 space-y-2">
          {navItems.map(item => {
            const isActive = item.path === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#D4FF47] text-[#0A3323] font-bold shadow-[0_0_20px_rgba(212,255,71,0.2)]' 
                    : 'text-[#F3F6F4]/60 hover:bg-white/10 hover:text-[#F3F6F4]'
                }`}
              >
                 <item.icon size={20} />
                 <span>{item.label}</span>
                 {isActive && (
                   <motion.div layoutId="sidebar-active" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0A3323]" />
                 )}
              </Link>
            );
          })}
       </nav>

       <div className="mt-auto pt-6 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-xl w-full transition-colors"
          >
             <LogOut size={20} />
             <span className="font-bold text-sm">Sign Out</span>
          </button>
       </div>
    </div>
  );
};