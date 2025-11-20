"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { ToastContainer, toast, ToastOptions, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {

  const notify = (message: string, type: NotificationType = "info") => {
    const options: ToastOptions = {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    };

    switch (type) {
      case "success":
        toast.success(message, options);
        break;
      case "error":
        toast.error(message, options);
        break;
      case "warning":
        toast.warn(message, options);
        break;
      case "info":
      default:
        toast.info(message, options);
        break;
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <ToastContainer />
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