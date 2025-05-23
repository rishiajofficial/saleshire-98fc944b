
import React from 'react';
import Navbar from './Navbar';
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  hideNavbar?: boolean;
  title?: string;
}

const MainLayout = ({ children, hideNavbar = false, title }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isMobile && !hideNavbar && <Navbar />}
      <main className="flex-1">
        {title && (
          <div className="pt-6 pb-2 px-4 sm:px-6">
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
