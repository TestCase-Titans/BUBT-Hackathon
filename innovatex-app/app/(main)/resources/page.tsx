'use client';
import { motion } from 'framer-motion';
import { Leaf, ChevronRight } from 'lucide-react';
import { SEED_RESOURCES } from '@/lib/data';
import PageWrapper from '@/components/PageWrapper';

export default function ResourcesPage() {
  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 overflow-y-auto h-full max-w-7xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-2">Library</h2>
        <p className="text-gray-500 mb-8">Guides for a sustainable kitchen.</p>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
      
          <div className="break-inside-avoid bg-[#0A3323] p-6 rounded-2xl text-[#F3F6F4] text-center mb-6">
              <div className="w-12 h-12 bg-[#D4FF47] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="text-[#0A3323]" />
              </div>
              <h3 className="font-serif text-2xl mb-2">Zero Waste Challenge</h3>
              <p className="text-sm text-[#F3F6F4]/70 mb-6">Join 500+ locals reducing their footprint this week.</p>
              <button className="w-full py-3 bg-[#D4FF47] text-[#0A3323] rounded-xl font-bold text-sm hover:bg-white transition-colors">Join Now</button>
          </div>

          {SEED_RESOURCES.map((resource, idx) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="break-inside-avoid bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
            >
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#F3F6F4] rounded text-gray-500">{resource.type}</span>
                  <span className="text-[10px] font-bold text-[#0A3323] bg-[#D4FF47]/20 px-2 py-1 rounded text-[#0A3323]">{resource.category}</span>
               </div>
               <h3 className="font-bold text-xl text-[#0A3323] mb-3 leading-tight">{resource.title}</h3>
               <p className="text-sm text-gray-500 leading-relaxed mb-4">{resource.content}</p>
               <div className="flex items-center text-[#0A3323] text-xs font-bold cursor-pointer group">
                   <span className="group-hover:underline">Read Full Guide</span> 
                   <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}