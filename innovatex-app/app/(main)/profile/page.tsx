'use client';
import { LogOut, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import PageWrapper from '@/components/PageWrapper';

export default function ProfilePage() {
  const { logout } = useApp();

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 max-w-4xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-8">My Profile</h2>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="w-24 h-24 rounded-full bg-[#D4FF47] text-[#0A3323] text-3xl font-bold flex items-center justify-center shadow-lg border-4 border-[#F3F6F4]">
                JD
            </div>
            <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl font-bold text-[#0A3323]">Jane Doe</h3>
                <p className="text-gray-500">Premium Member since 2023</p>
                <div className="flex gap-2 mt-4 justify-center md:justify-start">
                    <span className="px-3 py-1 bg-[#E8F5E9] text-[#0A3323] text-xs font-bold rounded-full">Dhaka</span>
                    <span className="px-3 py-1 bg-[#E8F5E9] text-[#0A3323] text-xs font-bold rounded-full">Vegetarian</span>
                </div>
            </div>
            <button className="px-6 py-2 border border-gray-200 rounded-xl font-bold text-[#0A3323] hover:bg-gray-50 transition-colors">Edit</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0A3323]">Preferences</h3>
              <div className="bg-white p-5 rounded-2xl flex justify-between items-center">
                  <span className="font-medium text-[#0A3323]">Household Size</span>
                  <span className="font-bold text-gray-500">4 Members</span>
              </div>
              <div className="bg-white p-5 rounded-2xl flex justify-between items-center">
                  <span className="font-medium text-[#0A3323]">Dietary Mode</span>
                  <span className="font-bold text-gray-500">Vegetarian</span>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-lg font-bold text-[#0A3323]">Account</h3>
              {['Notifications', 'Export Data', 'Privacy Policy', 'Help Center'].map(item => (
                  <button key={item} className="w-full bg-white p-5 rounded-2xl flex justify-between items-center text-[#0A3323] hover:bg-gray-50 transition-colors group">
                      {item}
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#0A3323]" />
                  </button>
              ))}
           </div>
        </div>

        <button 
          onClick={logout}
          className="w-full mt-12 p-4 rounded-2xl border-2 border-[#FF6B6B] text-[#FF6B6B] font-bold flex items-center justify-center gap-2 hover:bg-[#FF6B6B] hover:text-white transition-colors max-w-md mx-auto lg:mx-0"
        >
           <LogOut size={20} />
           Log Out
        </button>
      </div>
    </PageWrapper>
  );
}