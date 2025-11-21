'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export const ChatFab = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Don't show the button if we are already on the chat page
  if (pathname === '/chat') return null;

  return (
    <div className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-[60]">
      <motion.button
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/chat')}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center"
      >
        {/* Tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute right-full mr-3 bg-white text-[#0A3323] px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg whitespace-nowrap hidden lg:block border border-gray-100"
            >
              Ask NourishBot 🤖
            </motion.div>
          )}
        </AnimatePresence>

        {/* Button */}
        <div className="w-14 h-14 bg-[#0A3323] rounded-full flex items-center justify-center shadow-xl shadow-[#0A3323]/30 border-2 border-[#D4FF47] overflow-hidden relative">
            {/* Shimmer Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 3 }}
            />
            <Sparkles size={24} className="text-[#D4FF47]" fill="#D4FF47" />
        </div>
      </motion.button>
    </div>
  );
};