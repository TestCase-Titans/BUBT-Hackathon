"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionProvider, useSession, signOut } from "next-auth/react";

const AppContext = createContext<any>(null);

// 1. Internal Component to handle Logic using useSession()
function AppContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [inventory, setInventory] = useState<any[]>([]);
  const router = useRouter();

  // 2. Sync NextAuth Session with Local State
  const user = session?.user || null;

  useEffect(() => {
    if (status === "authenticated") {
      fetchInventory();
    }
  }, [status]);

  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setInventory(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      setInventory([]);
    }
  };

  // 3. Real Logout that clears the Cookie
  const logout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // 4. Dummy login helper (NextAuth handles the real login via signIn in AuthPage)
  const login = () => {
    router.push("/dashboard");
  };

  return (
    <AppContext.Provider
      value={{ user, login, logout, inventory, setInventory, isLoading: status === "loading" }}
    >
      {children}
    </AppContext.Provider>
  );
}

// 5. Wrap everything in SessionProvider
export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppContent>{children}</AppContent>
    </SessionProvider>
  );
}

export const useApp = () => useContext(AppContext);