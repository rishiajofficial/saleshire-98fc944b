
import React from 'react';
import Navbar from './Navbar';
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  hideNavbar?: boolean;
}

const MainLayout = ({ children, hideNavbar = false }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isMobile && !hideNavbar && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
