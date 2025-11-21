'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, Loader2, Save, UploadCloud, X, Tag, Plus, Trash2, Calendar } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useNotification } from '@/context/NotificationContext';

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

interface ScanFormData {
  name: string;
  category: string[];
  quantity: number;
  unit: string;
  expiryDays: number;
  cost: number;
  expirationDate: string; // NEW: Field for the actual date
}

export default function ScanPage() {
  const router = useRouter();
  const { setInventory } = useApp();
  const { notify } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI States
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  
  // Data States
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScanFormData[]>([]);

  // Env variables
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // 1. Trigger File Input
  const handleBoxClick = () => {
    if (!scanning && !scanned) { 
      fileInputRef.current?.click();
    }
  };

  // 2. Handle Image Upload & AI Analysis
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        notify("Cloudinary configuration missing");
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
      // A. Upload to Cloudinary
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: data,
      });
      const uploadResult = await uploadRes.json();
      
      if (uploadResult.secure_url) {
        setUploadedImageUrl(uploadResult.secure_url);

        // B. Call AI API
        try {
           const aiResponse = await fetch('/api/scan', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ imageUrl: uploadResult.secure_url })
           });
           const aiResult = await aiResponse.json();

           if (aiResult.success && Array.isArray(aiResult.data)) {
              const newItems = aiResult.data.map((item: any) => {
                // Logic: Use AI detected date, OR calculate based on days
                let finalDate = item.expirationDate;
                
                if (!finalDate) {
                    const days = Number(item.expiryDays) || 7;
                    const d = new Date();
                    d.setDate(d.getDate() + days);
                    finalDate = d.toISOString().split('T')[0];
                }

                return {
                    name: item.name || 'Unknown Item',
                    category: item.category ? [item.category] : ['General'],
                    quantity: Number(item.quantity) || 1,
                    unit: item.unit || 'pcs',
                    expiryDays: Number(item.expiryDays) || 7,
                    cost: Number(item.cost) || 0,
                    expirationDate: finalDate
                };
              });
              setScannedItems(newItems);
           } else {
              // Fallback
              const today = new Date().toISOString().split('T')[0];
              setScannedItems([{ name: '', category: [], quantity: 1, unit: 'pcs', expiryDays: 7, cost: 0, expirationDate: today }]);
           }
        } catch (aiError) {
          console.error("AI Error", aiError);
          const today = new Date().toISOString().split('T')[0];
          setScannedItems([{ name: '', category: [], quantity: 1, unit: 'pcs', expiryDays: 7, cost: 0, expirationDate: today }]);
        }
        
        setScanned(true);
      } else {
        notify("Upload failed: " + (uploadResult.error?.message || "Unknown error"), "error");
        setScanned(false);
      }
    } catch (error) {
      console.error("Image Upload Error:", error);
      notify("Image upload failed!", "error");
      setScanned(false);
    } finally {
      setScanning(false);
      if(e.target) e.target.value = '';
    }
  };

  // Update item helpers
  const updateItem = (index: number, field: keyof ScanFormData, value: any) => {
    const updated = [...scannedItems];
    // @ts-ignore
    updated[index] = { ...updated[index], [field]: value };
    setScannedItems(updated);
  };

  const toggleItemCategory = (index: number, cat: string) => {
    const updated = [...scannedItems];
    const currentCats = updated[index].category;
    if (currentCats.includes(cat)) {
        updated[index].category = currentCats.filter(c => c !== cat);
    } else {
        updated[index].category = [cat]; // Keep single category for now
    }
    setScannedItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = scannedItems.filter((_, i) => i !== index);
    setScannedItems(updated);
  };

  const addNewEmptyItem = () => {
    const today = new Date().toISOString().split('T')[0];
    setScannedItems([...scannedItems, { name: '', category: [], quantity: 1, unit: 'pcs', expiryDays: 7, cost: 0, expirationDate: today }]);
  };

  const handleResetScan = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setScanned(false);
      setUploadedImageUrl(null);
      setScannedItems([]);
  };

  // Save ALL items
  const handleSaveAll = async () => {
    if (scannedItems.length === 0) return;

    try {
      const savePromises = scannedItems.map(item => {
          if (!item.name) return null;
          
          // Use the explicit date from the input field
          const expirationDate = new Date(item.expirationDate);
          
          return fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit,
              expirationDate: expirationDate, // Updated to use the specific date
              imageUrl: uploadedImageUrl,
              costPerUnit: item.cost,
            })
          }).then(res => res.json());
      });

      const results = await Promise.all(savePromises.filter(Boolean));

      if (results.length > 0) {
         const formattedItems = results.map((savedItem: any) => {
             // Calculate days remaining for Context update
             const now = new Date();
             const expiry = new Date(savedItem.expirationDate);
             const diffTime = expiry.getTime() - now.getTime();
             const expiryDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
             
             return {
                id: savedItem._id,
                name: savedItem.name,
                category: savedItem.category,
                quantity: savedItem.quantity,
                unit: savedItem.unit,
                image: savedItem.imageUrl || "📦",
                costPerUnit: savedItem.costPerUnit,
                expiryDays: expiryDays, 
                expirationDate: savedItem.expirationDate,
                status: savedItem.status
             };
         });
         
         setInventory((prev: any) => [...(Array.isArray(prev) ? prev : []), ...formattedItems]);
         router.push('/inventory');
      }
    } catch (error) {
      console.error("Save Error:", error);
      notify("Failed to save items!", "error");
    }
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

        {!scanned && (
            <div className="flex-1 flex flex-col items-center justify-center lg:bg-white lg:rounded-3xl lg:p-12 lg:border lg:border-dashed lg:border-gray-200 transition-all">
            <motion.div 
                onClick={handleBoxClick}
                whileHover={!scanning ? { scale: 1.02 } : {}}
                className={`w-full lg:w-2/3 aspect-[4/5] lg:aspect-video max-h-[500px] rounded-3xl border-2 border-dashed relative overflow-hidden transition-all cursor-pointer shadow-sm
                ${scanning ? 'border-[#0A3323] bg-gray-100' : 'border-gray-300 bg-white lg:bg-gray-50'}
                `}
            >
                {!scanning && (
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
            </motion.div>
            </div>
        )}

        {/* --- RESULTS VIEW --- */}
        <AnimatePresence>
            {scanned && uploadedImageUrl && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8 flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-200px)]"
                >
                    {/* Left: Image Preview */}
                    <div className="w-full lg:w-1/3 flex-shrink-0">
                        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner lg:sticky lg:top-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={uploadedImageUrl} alt="Scanned Item" className="w-full h-full object-cover" />
                            <div className="absolute top-3 left-3 bg-[#D4FF47] text-[#0A3323] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                                <Check size={12} /> Scan Complete
                            </div>
                            <button 
                                onClick={handleResetScan}
                                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/90 backdrop-blur text-[#0A3323] rounded-full text-xs font-bold shadow-lg hover:bg-white"
                            >
                                Scan Another
                            </button>
                        </div>
                    </div>

                    {/* Right: Items List */}
                    <div className="flex-1 flex flex-col bg-white lg:bg-transparent rounded-3xl lg:rounded-none overflow-hidden">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="text-2xl font-bold text-[#0A3323] flex items-center gap-2">
                                <UploadCloud size={24} /> Detected Items
                            </h3>
                            <button onClick={addNewEmptyItem} className="text-xs font-bold text-[#0A3323] flex items-center gap-1 hover:underline bg-white px-3 py-1 rounded-full shadow-sm">
                                <Plus size={14}/> Add Item
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-20 lg:pb-0 scrollbar-hide">
                            {scannedItems.map((item, index) => (
                                <motion.div 
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 group relative"
                                >
                                    <button 
                                        onClick={() => removeItem(index)} 
                                        className="absolute top-3 right-3 text-gray-300 hover:text-red-500 p-2"
                                    >
                                        <X size={16} />
                                    </button>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full p-2 bg-[#F3F6F4] rounded-xl mt-1 outline-none focus:ring-1 focus:ring-[#D4FF47] text-[#0A3323] font-bold text-lg"
                                                value={item.name}
                                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                placeholder="e.g. Apple"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                                                <Tag size={10} /> Categories
                                            </label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {CATEGORIES.map(cat => {
                                                    const isSelected = item.category.includes(cat);
                                                    return (
                                                        <button
                                                            key={cat}
                                                            onClick={() => toggleItemCategory(index, cat)}
                                                            className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                                                isSelected 
                                                                ? 'bg-[#0A3323] text-[#D4FF47] border-[#0A3323]' 
                                                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* UPDATED GRID: Added Expiry Date Column */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                                                <div className="flex gap-1 mt-1">
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-2 bg-[#F3F6F4] rounded-lg outline-none text-[#0A3323] font-bold text-sm"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Unit</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full p-2 bg-[#F3F6F4] rounded-lg outline-none text-[#0A3323] font-bold text-sm mt-1"
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                />
                                            </div>
                                            {/* NEW: Expiry Date Input */}
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase text-red-400">Expiry</label>
                                                <input 
                                                    type="date" 
                                                    className="w-full p-2 bg-[#F3F6F4] rounded-lg outline-none text-[#0A3323] font-bold text-sm mt-1"
                                                    value={item.expirationDate}
                                                    onChange={(e) => updateItem(index, 'expirationDate', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Cost (৳)</label>
                                                <input 
                                                    type="number" 
                                                    className="w-full p-2 bg-[#F3F6F4] rounded-lg outline-none text-[#0A3323] font-bold text-sm mt-1"
                                                    value={item.cost}
                                                    onChange={(e) => updateItem(index, 'cost', Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            <div className="pt-4 pb-8">
                                <button 
                                    onClick={handleSaveAll}
                                    className="w-full bg-[#0A3323] text-[#D4FF47] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#0F4D34] transition-colors shadow-lg active:scale-95"
                                >
                                    <Save size={20} /> Add All to Pantry
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}