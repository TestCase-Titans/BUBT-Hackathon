'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Check } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleSimulateUpload = () => {
    setScanning(true);
    setTimeout(() => {
        setScanning(false);
        setScanned(true);
    }, 3000);
  };

  return (
    <PageWrapper>
      <div className="h-full pb-24 pt-8 px-6 lg:px-12 flex flex-col max-w-5xl mx-auto">
        <div className="text-center lg:text-left mb-8">
          <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-2">Smart Scan</h2>
          <p className="text-gray-500">Upload a receipt or snap a photo of your grocery haul.</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center lg:bg-white lg:rounded-3xl lg:p-12 lg:border lg:border-dashed lg:border-gray-200">
           <motion.div 
             onClick={!scanning && !scanned ? handleSimulateUpload : undefined}
             whileHover={!scanning && !scanned ? { scale: 1.02 } : {}}
             className={`w-full lg:w-2/3 aspect-[4/5] lg:aspect-video max-h-[500px] rounded-3xl border-2 border-dashed relative overflow-hidden transition-all cursor-pointer
               ${scanned ? 'border-[#D4FF47] bg-[#0A3323]' : scanning ? 'border-[#0A3323] bg-gray-100' : 'border-gray-300 bg-white lg:bg-gray-50'}
             `}
           >
              {!scanning && !scanned && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-[#F3F6F4] flex items-center justify-center mb-4 shadow-sm">
                          <Camera size={32} className="text-[#0A3323]" />
                      </div>
                      <p className="font-bold text-[#0A3323] text-lg">Tap or Drop Image to Scan</p>
                      <p className="text-xs text-gray-400 mt-1">Supports .jpg, .png</p>
                  </div>
              )}

              {scanning && (
                  <>
                     <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                        <span className="text-6xl lg:text-9xl">🥦</span>
                     </div>
                     <motion.div 
                       className="absolute top-0 left-0 right-0 h-1 bg-[#D4FF47] shadow-[0_0_20px_#D4FF47] z-20"
                       animate={{ top: ["0%", "100%", "0%"] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     />
                     <div className="absolute inset-0 bg-[#0A3323]/20 z-10" />
                     <div className="absolute bottom-8 w-full text-center z-30">
                         <span className="bg-black/50 text-white px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest backdrop-blur-md">Processing Intelligence...</span>
                     </div>
                  </>
              )}

              {scanned && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-[#D4FF47]"
                  >
                      <div className="w-16 h-16 rounded-full bg-[#D4FF47] flex items-center justify-center mb-6">
                          <Check size={32} className="text-[#0A3323]" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Scan Complete</h3>
                      <p className="text-white/60 text-sm mt-2 mb-8">Identified 3 items successfully.</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setScanned(false); }}
                        className="px-8 py-3 bg-[#D4FF47] text-[#0A3323] rounded-xl font-bold text-sm hover:bg-white transition-colors"
                      >
                          Scan Another
                      </button>
                  </motion.div>
              )}
           </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}