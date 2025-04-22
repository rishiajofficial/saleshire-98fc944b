
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getNavItems } from "./navigation/nav-items";
import { MobileNav } from "./navigation/mobile-nav";
import { DesktopNav } from "./navigation/desktop-nav";

interface MainLayoutProps {
  children: React.ReactNode;
}

// Key for storing sidebar state in localStorage
const SIDEBAR_STATE_KEY = "sidebar-expanded";

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  // Initialize sidebar state from localStorage or default to expanded
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    return savedState !== null ? savedState === "true" : true;
  });
  
  const [activeDropdowns, setActiveDropdowns] = useState<string[]>([]);

  // Only close mobile menu on route change, don't affect desktop sidebar
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, isSidebarExpanded.toString());
  }, [isSidebarExpanded]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "An error occurred while signing out.",
      });
    }
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdowns((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const navItems = getNavItems(profile?.role).filter((item) =>
    item.role.includes(profile?.role || "")
  );

  return (
    <div className="flex min-h-screen bg-background">
      {isMobile ? (
        <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <MobileNav
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              activeDropdowns={activeDropdowns}
              toggleDropdown={toggleDropdown}
              navItems={navItems}
              profile={profile}
              pathname={location.pathname}
              onNavigate={(to) => navigate(to)}
            />
            <div className="font-bold text-lg">Hiring Portal</div>
          </div>
        </header>
      ) : (
        <DesktopNav
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
          activeDropdowns={activeDropdowns}
          toggleDropdown={toggleDropdown}
          navItems={navItems}
          profile={profile}
          pathname={location.pathname}
          handleSignOut={handleSignOut}
        />
      )}

      <div className={`flex-1 ${isMobile ? "pt-16" : ""}`} style={{ 
        paddingLeft: isMobile ? 0 : (isSidebarExpanded ? '16rem' : '5rem'),
        transition: 'padding-left 0.3s'
      }}>
        <main className="container py-6 md:py-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
