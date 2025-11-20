import "./globals.css";
import type { ReactNode } from "react";
import { AppProvider } from "@/context/AppContext";
import { NotificationProvider } from "@/context/NotificationContext"; // 1. Ensure this import exists

export const metadata = {
  title: "Eco-Loop",
  description: "Sustainable Food Management System",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <html lang="en">
      <body className="bg-[#F3F6F4] text-[#0A3323] font-sans selection:bg-[#D4FF47] selection:text-[#0A3323]">
        <AppProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AppProvider>
      </body>
    </html>
  );
}