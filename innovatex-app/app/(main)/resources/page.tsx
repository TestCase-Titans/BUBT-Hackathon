"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Leaf, ChevronRight, Sparkles, X, ExternalLink, FileText, Loader2 } from "lucide-react";
import PageWrapper from "@/components/PageWrapper";
import { useApp } from "@/context/AppContext";
import { useNotification } from "@/context/NotificationContext";
import ReactMarkdown from "react-markdown";

// URL Helper
const getValidUrl = (url: string) => {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim();
  if (clean === '' || clean === '#') return null;
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    return `https://${clean}`;
  }
  return clean;
};

export default function ResourcesPage() {
  const { inventory } = useApp();
  const { notify } = useNotification();
  
  const [resources, setResources] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [others, setOthers] = useState<any[]>([]);
  
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        setResources(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed to load resources", err));
  }, []);

  useEffect(() => {
    if (resources.length > 0) {
      const userCategories = new Set<string>();
      const safeInventory = Array.isArray(inventory) ? inventory : [];
      safeInventory.forEach((item: any) => {
        if (Array.isArray(item.category)) {
          item.category.forEach((cat: string) => userCategories.add(cat));
        } else if (typeof item.category === 'string') {
          userCategories.add(item.category);
        }
      });

      const recs: any[] = [];
      const rest: any[] = [];

      resources.forEach(res => {
        const isRelevant = 
            userCategories.has(res.category) || 
            ["General", "Waste Reduction"].includes(res.category) ||
            Array.from(userCategories).some(userCat => userCat.includes(res.category));

        if (isRelevant) {
            recs.push(res);
        } else {
            rest.push(res);
        }
      });
      setRecommended(recs);
      setOthers(rest);
    }
  }, [resources, inventory]);

  const handleJoinChallenge = () => {
      notify("🎉 You've joined the Zero Waste Challenge!", "success");
  };

  const handleExpandWithAI = async () => {
    if (!selectedResource) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          // Explicitly asking for a guide
          message: `Write a comprehensive guide for: "${selectedResource.title}"`, 
          history: [],
          mode: 'guide' // <--- THIS IS THE NEW FLAG
        }),
      });

      const data = await res.json();
      
      if (data.reply) {
        setSelectedResource((prev: any) => ({
            ...prev,
            content: data.reply,
            isAiGenerated: true
        }));
      } else {
        notify("AI unavailable right now", "error");
      }
    } catch (error) {
      notify("Failed to generate content", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <PageWrapper>
      <div className="pb-24 lg:pb-8 pt-8 px-6 lg:px-12 overflow-y-auto h-full max-w-7xl mx-auto">
        <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-serif text-[#0A3323] mb-2">Library</h2>
            <p className="text-gray-500">Smart guides tailored to your pantry.</p>
        </div>

        {recommended.length > 0 && (
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                    <Sparkles className="text-[#D4FF47] fill-[#D4FF47]" size={20} />
                    <h3 className="text-xl font-bold text-[#0A3323]">Recommended for You</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-[#0A3323] p-6 rounded-2xl text-[#F3F6F4] text-center flex flex-col justify-center shadow-lg transform transition-transform hover:scale-[1.02]">
                        <div className="w-12 h-12 bg-[#D4FF47] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md shadow-[#D4FF47]/20">
                            <Leaf className="text-[#0A3323]" />
                        </div>
                        <h3 className="font-serif text-2xl mb-2">Zero Waste Challenge</h3>
                        <p className="text-sm text-[#F3F6F4]/70 mb-6">Join 500+ locals reducing their footprint this week.</p>
                        <button onClick={handleJoinChallenge} className="w-full py-3 bg-[#D4FF47] text-[#0A3323] rounded-xl font-bold text-sm hover:bg-white transition-colors">Join Now</button>
                    </div>
                    {recommended.map((resource: any) => (
                        <ResourceCard key={resource.id} resource={resource} recommended={true} onView={setSelectedResource} />
                    ))}
                </div>
            </div>
        )}

        {others.length > 0 && (
            <div>
                <h3 className="text-xl font-bold text-[#0A3323] mb-6 border-t border-gray-200 pt-8">Explore More</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.map((resource: any) => (
                        <ResourceCard key={resource.id} resource={resource} onView={setSelectedResource} />
                    ))}
                </div>
            </div>
        )}

        <AnimatePresence>
            {selectedResource && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setSelectedResource(null)}
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white w-full max-w-2xl rounded-3xl p-8 z-[70] relative shadow-2xl max-h-[80vh] overflow-y-auto scrollbar-hide"
                    >
                        <button onClick={() => setSelectedResource(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-[#D4FF47] text-[#0A3323] text-xs font-bold rounded-full uppercase tracking-wide">{selectedResource.category}</span>
                            {selectedResource.isAiGenerated && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full flex items-center gap-1"><Sparkles size={10} /> AI Generated</span>
                            )}
                        </div>

                        <h2 className="text-3xl font-serif text-[#0A3323] mb-6 leading-tight">{selectedResource.title}</h2>

                        <div className="prose prose-stone max-w-none text-gray-600 leading-relaxed text-sm">
                           {selectedResource.content ? (
                               <ReactMarkdown components={{
                                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-[#0A3323] mt-6 mb-4" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-xl font-bold text-[#0A3323] mt-5 mb-3" {...props} />,
                                    ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-4" {...props} />,
                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                    strong: ({node, ...props}) => <span className="font-bold text-[#0A3323]" {...props} />
                                 }}>
                                   {selectedResource.content}
                               </ReactMarkdown>
                           ) : (
                               <p className="italic text-gray-400">{selectedResource.description || "No detailed content available."}</p>
                           )}
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3 border-t border-gray-100 pt-6">
                             {(!selectedResource.content || selectedResource.content.length < 200) && !getValidUrl(selectedResource.url) && (
                                 <button 
                                    onClick={handleExpandWithAI}
                                    disabled={isGenerating}
                                    className="flex-1 py-3 bg-gradient-to-r from-[#0A3323] to-[#0F4D34] text-[#D4FF47] rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                                 >
                                     {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18} />}
                                     {isGenerating ? "Generating Guide..." : "Expand with AI"}
                                 </button>
                             )}

                             {getValidUrl(selectedResource.url) && (
                                 <a 
                                    href={getValidUrl(selectedResource.url)!} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-[#F3F6F4] text-[#0A3323] rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                 >
                                    Read Original <ExternalLink size={16} />
                                 </a>
                             )}
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}

function ResourceCard({ resource, recommended, onView }: { resource: any, recommended?: boolean, onView: (r: any) => void }) {
    const validUrl = getValidUrl(resource.url);
    const isExternal = !!validUrl && (!resource.content || resource.content.length < 50);

    const handleClick = () => {
        if (isExternal && validUrl) {
            window.open(validUrl, '_blank');
        } else {
            onView(resource);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleClick}
            className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border group cursor-pointer flex flex-col h-full relative overflow-hidden ${recommended ? 'border-[#D4FF47] ring-1 ring-[#D4FF47]/20' : 'border-gray-100'}`}
        >
            <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-[#F3F6F4] rounded text-gray-500">{resource.type}</span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${recommended ? 'bg-[#D4FF47] text-[#0A3323]' : 'bg-gray-100 text-gray-500'}`}>{resource.category}</span>
            </div>
            
            <h3 className="font-bold text-xl text-[#0A3323] mb-3 leading-tight relative z-10 line-clamp-2">{resource.title}</h3>
            
            <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1 line-clamp-3 relative z-10">{resource.description || resource.content || "Tap to view details."}</p>

            <div className="flex items-center text-[#0A3323] text-xs font-bold mt-auto relative z-10">
                <span className="group-hover:underline">{isExternal ? "Open Link" : "Read Full Guide"}</span>
                {isExternal ? <ExternalLink size={14} className="ml-1 group-hover:translate-x-1 transition-transform" /> : <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />}
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#D4FF47]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
    );
}