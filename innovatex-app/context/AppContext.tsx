'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SEED_INVENTORY } from '@/lib/data';

const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [inventory, setInventory] = useState(SEED_INVENTORY);
  const router = useRouter();

  const login = (userData: any) => {
    setUser({ name: "Jane Doe", ...userData });
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    router.push('/');
  };

  return (
    <AppContext.Provider value={{ user, login, logout, inventory, setInventory }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);