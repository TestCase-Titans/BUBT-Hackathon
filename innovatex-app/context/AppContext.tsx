"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [inventory, setInventory] = useState();
  const router = useRouter();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch("/api/inventory");
        if (res.ok) {
          const data = await res.json();
          setInventory(data);
        }
      } catch (error) {
        console.error("Failed to connect to backend:", error);
      }
    };
    fetchInventory();
  }, []);

  const login = (userData: any) => {
    setUser({ name: "Jane Doe", ...userData });
    router.push("/dashboard");
  };

  const logout = () => {
    setUser(null);
    router.push("/");
  };

  return (
    <AppContext.Provider
      value={{ user, login, logout, inventory, setInventory }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
