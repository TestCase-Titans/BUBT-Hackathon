'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, Loader2, Save, UploadCloud, X, Hash, Calendar, Coins, Tag } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

// Detailed Categories List
const CATEGORIES = [
  "Meat Protein",
  "Fish Protein",
  "Dairy Protein",
  "Vegetable Protein",
  "Vegetable",
  "Fruit",
  "Grain",
  "Dairy",
  "Spices",
  "Fats",
  "Snack",
  "General"
];

// Define the interface to prevent 'never[]' errors
interface ScanFormData {
  name: string;
  category: string[];
  quantity: number;
  unit: string;
  expiryDays: number;
  cost: number;
}

export default function ScanPage() {
  const router = useRouter();
  const { setInventory } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI States
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  
  // Data States
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  
  // FIX: Explicitly type the state here
  const [newItemFormData, setNewItemFormData] = useState<ScanFormData>({
    name: '',
    category: [], // Default value as array
    quantity: 1,
    unit: 'pcs',
    expiryDays: 7,
    cost: 0,
  });

  // Env variables
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // 1. Trigger File Input
  const handleBoxClick = () => {
    if (!scanning && !scanned) { 
      fileInputRef.current?.click();
    }
  };

  // 2. Handle Image Upload (Cloudinary)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        alert("Cloudinary configuration missing in .env file");
        return;
    }

    setScanning(true);
    setScanned(false); 
    setUploadedImageUrl(null); 

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", UPLOAD_PRESET);
    data.append("cloud_name", CLOUD_NAME);

    try {
      const [uploadResult] = await Promise.all([
        fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: data,
        }).then(res => res.json()),
        new Promise(resolve => setTimeout(resolve, 2000)) 
      ]);
      
      if (uploadResult.secure_url) {
        setUploadedImageUrl(uploadResult.secure_url);
        setScanned(true);
        
        setNewItemFormData({
            name: '',
            category: [],
            quantity: 1,
            unit: 'pcs',
            expiryDays: 7,
            cost: 0,
        });
      } else {
        console.error("Cloudinary Upload Error:", uploadResult);
        alert("Upload failed: " + (uploadResult.error?.message || "Unknown error"));
        setScanned(false);
      }
    } catch (error) {
      console.error("Image Upload Error:", error);
      alert("Image upload failed! Check console for details.");
      setScanned(false);
    } finally {
      setScanning(false);
      if(e.target) e.target.value = '';
    }
  };

  // Helper to toggle categories
  const toggleCategory = (cat: string) => {
    setNewItemFormData(prev => {
        const exists = prev.category.includes(cat);
        return {
            ...prev,
            category: exists 
                ? prev.category.filter(c => c !== cat) // Remove
                : [...prev.category, cat] // Add
        };
    });
  };

  // 3. Save to Inventory
  const handleSaveToInventory = async () => {
  if (!newItemFormData.name || !uploadedImageUrl) {
    alert("Please provide an item name and ensure an image is uploaded.");
    return;
  }
  if (newItemFormData.cost < 0) {
    alert("Cost cannot be negative.");
    return;
  }
  if (newItemFormData.category.length === 0) {
      alert("Please select at least one category.");
      return;
  }
    
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + Number(newItemFormData.expiryDays));

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newItemFormData.name,
          category: newItemFormData.category,
          quantity: newItemFormData.quantity,
          unit: newItemFormData.unit,
          expirationDate: expirationDate,
          imageUrl: uploadedImageUrl,
          costPerUnit: newItemFormData.cost,
        })
      });

      if (res.ok) {
        const savedItem = await res.json();

        // Update Context
        const formattedItem = {
            id: savedItem._id,
            name: savedItem.name,
            category: savedItem.category,
            quantity: savedItem.quantity,
            unit: savedItem.unit,
            image: savedItem.imageUrl || "📦",
            costPerUnit: savedItem.costPerUnit,
            expiryDays: newItemFormData.expiryDays,
            expirationDate: savedItem.expirationDate,
            status: savedItem.status
        };

        setInventory((prev: any) => [...(Array.isArray(prev) ? prev : []), formattedItem]);
        
        router.push('/inventory'); 
      } else {
          alert("Failed to save item to inventory. Please try again.");
      }
    } catch (error) {
      console.error("Saving to Inventory Error:", error);
      alert("Failed to save item to inventory!");
    }
  };

  const handleResetScan = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setScanned(false);
      setUploadedImageUrl(null);
      setNewItemFormData({
          name: '',
          category: [],
          quantity: 1,
          unit: 'pcs',
          expiryDays: 7,
          cost: 0,
      });
  };

  return (
    <PageWrapper>
      <div className="h-full pb-24 pt-8 px-6 lg:px-12 flex flex-col max-w-5xl mx-auto">
        <div className="text-center lg:text-left mb-8">
          <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-2">Smart Scan</h2>
          <p className="text-gray-500">Upload a receipt or snap a photo of your grocery haul.</p>
        </div>

        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
        />

        <div className="flex-1 flex flex-col items-center justify-center lg:bg-white lg:rounded-3xl lg:p-12 lg:border lg:border-dashed lg:border-gray-200 transition-all">
           <motion.div 
             onClick={handleBoxClick}
             whileHover={!scanning && !scanned ? { scale: 1.02 } : {}}
             className={`w-full lg:w-2/3 aspect-[4/5] lg:aspect-video max-h-[500px] rounded-3xl border-2 border-dashed relative overflow-hidden transition-all cursor-pointer shadow-sm
               ${scanned ? 'border-[#D4FF47] bg-[#0A3323]' : scanning ? 'border-[#0A3323] bg-gray-100' : 'border-gray-300 bg-white lg:bg-gray-50'}
             `}
           >
             {!scanning && !scanned && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
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
                        <span className="bg-black/50 text-white px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest backdrop-blur-md">
                            Processing Intelligence...
                        </span>
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
                   <p className="text-white/60 text-sm mt-2 mb-8">Image uploaded successfully.</p>
                   <button 
                     onClick={handleResetScan}
                     className="px-8 py-3 bg-[#D4FF47] text-[#0A3323] rounded-xl font-bold text-sm hover:bg-white transition-colors"
                   >
                       Scan Another
                   </button>
                 </motion.div>
             )}
           </motion.div>
        </div>

        <AnimatePresence>
            {scanned && uploadedImageUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-gray-100 flex flex-col lg:flex-row gap-6"
                >
                    <div className="w-full lg:w-1/2 flex-shrink-0 relative aspect-square lg:aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={uploadedImageUrl} alt="Scanned Item" className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-[#D4FF47] text-[#0A3323] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                            <Check size={12} /> Image Uploaded
                        </div>
                    </div>

                    <div className="flex-1 space-y-5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-[#0A3323] flex items-center gap-2">
                                <UploadCloud size={24} /> Item Details
                            </h3>
                            <button onClick={() => setScanned(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 shadow-sm">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</label>
                                <input 
                                    type="text" 
                                    autoFocus
                                    className="w-full p-3 bg-[#F3F6F4] rounded-xl mt-1 outline-none focus:ring-2 focus:ring-[#D4FF47] text-[#0A3323] font-medium placeholder:text-gray-400"
                                    placeholder="e.g. Apples, Milk"
                                    value={newItemFormData.name}
                                    onChange={(e) => setNewItemFormData({...newItemFormData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                                    <Tag size={12} /> Categories
                                </label>
                                <div className="flex flex-wrap gap-2 p-3 bg-[#F3F6F4] rounded-xl">
                                    {CATEGORIES.map(cat => {
                                        const isSelected = newItemFormData.category.includes(cat);
                                        return (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => toggleCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                                    isSelected 
                                                    ? 'bg-[#0A3323] text-[#D4FF47] border-[#0A3323] shadow-sm' 
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                {cat}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Qty & Unit</label>
                                <div className="flex gap-2 mt-1">
                                    <input 
                                        type="number" 
                                        className="w-2/3 p-3 bg-[#F3F6F4] rounded-xl outline-none text-[#0A3323] font-medium focus:ring-2 focus:ring-[#D4FF47]" 
                                        value={newItemFormData.quantity}
                                        onChange={(e) => setNewItemFormData({...newItemFormData, quantity: Number(e.target.value)})}
                                    />
                                    <input 
                                        type="text" 
                                        className="w-1/3 p-3 bg-[#F3F6F4] rounded-xl outline-none text-[#0A3323] font-medium placeholder:text-gray-400 focus:ring-2 focus:ring-[#D4FF47]" 
                                        value={newItemFormData.unit}
                                        placeholder="unit"
                                        onChange={(e) => setNewItemFormData({...newItemFormData, unit: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expires In (Days)</label>
                                    <div className="flex items-center bg-[#F3F6F4] rounded-xl mt-1 px-3">
                                        <Calendar size={16} className="text-gray-400 mr-2"/>
                                        <input 
                                            type="number" 
                                            className="w-full p-3 bg-transparent outline-none text-[#0A3323] font-medium"
                                            value={newItemFormData.expiryDays}
                                            onChange={(e) => setNewItemFormData({...newItemFormData, expiryDays: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cost (৳)</label>
                                    <div className="flex items-center bg-[#F3F6F4] rounded-xl mt-1 px-3">
                                        <span className="text-gray-400 font-bold mr-2">৳</span>
                                        <input 
                                            type="number" 
                                            step="0.01"
                                            className="w-full p-3 bg-transparent outline-none text-[#0A3323] font-medium"
                                            value={newItemFormData.cost}
                                            onChange={(e) => setNewItemFormData({...newItemFormData, cost: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSaveToInventory}
                            className="w-full bg-[#0A3323] text-[#D4FF47] py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 hover:bg-[#0F4D34] transition-colors shadow-lg active:scale-95"
                        >
                            <Save size={20} /> Add to Pantry
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}