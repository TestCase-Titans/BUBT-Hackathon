"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Bell } from "lucide-react";

// --- Types ---
type NotificationType = "success" | "error" | "warning" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

// --- Context ---
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// --- Helper: Get Icon & Color based on type ---
const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case "success":
      return { 
        icon: <CheckCircle size={20} />, 
        color: "bg-[#0A3323] text-[#D4FF47] border-[#D4FF47]" 
      };
    case "warning":
      return { 
        icon: <AlertCircle size={20} />, 
        color: "bg-[#FFF4E5] text-[#B45309] border-[#FCD34D]" 
      };
    case "error":
      return { 
        icon: <AlertCircle size={20} />, 
        color: "bg-[#FFEDED] text-[#FF6B6B] border-[#FF6B6B]" 
      };
    default:
      return { 
        icon: <Bell size={20} />, 
        color: "bg-white text-[#0A3323] border-gray-200" 
      };
  }
};

// --- Provider Component ---
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* --- Toast Container (Fixed Position) --- */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => {
            const style = getNotificationStyles(n.type);
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                layout
                className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md ${style.color}`}
              >
                <div className="mt-0.5 shrink-0">{style.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-bold leading-tight">{n.message}</p>
                </div>
                <button
                  onClick={() => removeNotification(n.id)}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

// --- Hook ---
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};