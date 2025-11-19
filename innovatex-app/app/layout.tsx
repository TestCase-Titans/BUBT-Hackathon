import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata = {
  title: 'Eco-Loop',
  description: 'Sustainable Food Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#F3F6F4] text-[#0A3323] font-sans selection:bg-[#D4FF47] selection:text-[#0A3323]">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}