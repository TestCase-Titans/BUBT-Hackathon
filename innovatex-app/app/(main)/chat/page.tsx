"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";
// Fixed Import: Using relative path
import PageWrapper from "../../../components/PageWrapper"; 
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I'm NourishBot. I see your pantry items. How can I help you save food and money today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 1. Ref for the suggestion container
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. Effect to handle horizontal scroll with mouse wheel
  useEffect(() => {
    const container = suggestionsRef.current;
    if (container) {
      const handleWheel = (e: WheelEvent) => {
        // If scrolling vertically (standard mouse wheel), translate to horizontal scroll
        if (e.deltaY !== 0) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
      };
      // Add passive: false to allow preventDefault which stops the page from scrolling vertically
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, []);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: "user", content: text } as Message];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text, 
          history: newMessages.slice(1) 
        }),
      });

      const data = await res.json();
      
      if (data.reply) {
        setMessages([...newMessages, { role: "bot", content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: "bot", content: "Sorry, I'm having trouble connecting to the eco-grid right now." }]);
      }
    } catch (error) {
      console.error("Chat failed", error);
      setMessages([...newMessages, { role: "bot", content: "Error: Could not reach NourishBot." }]);
    } finally {
      setLoading(false);
    }
  };

  const QuickPrompts = [
    "What can I cook with my expiring items?",
    "Give me a budget meal plan for this week.",
    "How do I store my vegetables to last longer?",
    "I have too many leftovers, any creative ideas?",
    "Show me local food donation centers.",
    "Explain the environmental impact of my pantry."
  ];

  return (
    <PageWrapper>
      <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-2rem)] max-w-4xl mx-auto pt-4 lg:pt-0 px-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
           <div className="w-10 h-10 bg-[#D4FF47] rounded-full flex items-center justify-center shadow-md">
              <Sparkles size={20} className="text-[#0A3323]" />
           </div>
           <div>
              <h2 className="text-xl font-serif font-bold text-[#0A3323]">NourishBot</h2>
              <p className="text-xs text-gray-500">AI Sustainability Assistant</p>
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pb-4">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === "user" ? "bg-gray-200 text-gray-600" : "bg-[#0A3323] text-[#D4FF47]"
                }`}
              >
                {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div
                className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                  m.role === "user"
                    ? "bg-[#F3F6F4] text-[#0A3323] rounded-tr-none"
                    : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                }`}
              >
                <ReactMarkdown 
                  components={{
                    ul: ({node, ...props}) => <ul className="list-disc ml-4 my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    strong: ({node, ...props}) => <span className="font-bold text-[#0A3323]" {...props} />
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <div className="flex gap-3">
               <div className="w-8 h-8 rounded-full bg-[#0A3323] flex items-center justify-center">
                  <Bot size={16} className="text-[#D4FF47]" />
               </div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 flex items-center gap-2">
                  <Loader2 className="animate-spin text-[#0A3323]" size={16} />
                  <span className="text-xs text-gray-400">Thinking...</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="mt-auto pt-2">
           {/* Quick Prompts (Only show if chat is short) */}
           {messages.length < 3 && (
             <div 
                ref={suggestionsRef}
                className="flex gap-2 overflow-x-auto pb-3 
                           /* Hide Scrollbar Logic */
                           [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                           cursor-grab active:cursor-grabbing"
             >
                {QuickPrompts.map((prompt, i) => (
                   <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="whitespace-nowrap px-4 py-2 bg-white border border-[#D4FF47] text-[#0A3323] text-xs font-bold rounded-full hover:bg-[#D4FF47] transition-colors flex-shrink-0"
                   >
                      {prompt}
                   </button>
                ))}
             </div>
           )}

           <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about recipes, waste, or impact..."
                className="w-full p-4 pr-12 rounded-2xl border-none bg-white shadow-lg focus:ring-2 focus:ring-[#D4FF47] outline-none text-[#0A3323]"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#0A3323] text-[#D4FF47] rounded-xl disabled:opacity-50 hover:scale-105 transition-transform"
              >
                <Send size={18} />
              </button>
           </div>
        </div>

      </div>
    </PageWrapper>
  );
}