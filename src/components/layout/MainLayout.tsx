
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { getNavItems } from "./navigation/nav-items";
import { MobileNav } from "./navigation/mobile-nav";
import { DesktopNav } from "./navigation/desktop-nav";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const SIDEBAR_STATE_KEY = "sidebar-expanded";

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    return savedState !== null ? savedState === "true" : true;
  });
  
  const [activeDropdowns, setActiveDropdowns] = useState<string[]>([]);
  const isCandidate = profile?.role === 'candidate';
  const isPublicPage = location.pathname === '/careers';

  useEffect(() => {
    let pageTitle = "Workforce";

    if (title) {
      pageTitle = title;
    } else {
      const path = location.pathname;
      if (path.includes("/dashboard")) {
        const role = path.split("/dashboard/")[1];
        switch (role) {
          case "candidate":
            pageTitle = "Candidate Dashboard";
            break;
          case "admin":
            pageTitle = "Admin Dashboard";
            break;
          case "manager":
            pageTitle = "Manager Dashboard";
            break;
          case "hr":
            pageTitle = "HR Dashboard";
            break;
          case "director":
            pageTitle = "Director Dashboard";
            break;
        }
      }
    }

    document.title = pageTitle;
  }, [location.pathname, title]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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

  // Public page navigation (for careers page)
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-background">
        <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center">
              <div className="font-bold text-lg">WorkForce</div>
            </Link>
            <nav className="flex items-center gap-4">
              <Link 
                to="/" 
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Home
              </Link>
              <Link 
                to="/careers" 
                className="text-sm font-medium text-primary"
              >
                Careers
              </Link>
              {user ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        <div className="pt-16">
          {children}
        </div>
      </div>
    );
  }

  // Normal authenticated layout
  return (
    <div className="flex min-h-screen bg-background">
      {!isCandidate && !isMobile ? (
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
      ) : null}

      <div className={`flex-1 ${isMobile || isCandidate ? "pt-16" : ""}`} style={{ 
        paddingLeft: (!isCandidate && !isMobile) ? (isSidebarExpanded ? '16rem' : '5rem') : 0,
        transition: 'padding-left 0.3s'
      }}>
        {(isMobile || isCandidate) && (
          <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
              {isMobile && !isCandidate && (
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
              )}
              <Link to={user ? `/dashboard/${profile?.role}` : "/"} className="flex items-center">
                <div className="font-bold text-lg">WorkForce</div>
              </Link>
            </div>
            {isCandidate && (
              <nav className="flex items-center gap-4">
                <Link 
                  to="/dashboard/candidate" 
                  className={`text-sm font-medium ${location.pathname === '/dashboard/candidate' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/training" 
                  className={`text-sm font-medium ${location.pathname === '/training' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Training
                </Link>
                <Link 
                  to="/application" 
                  className={`text-sm font-medium ${location.pathname === '/application' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  My Application
                </Link>
                <Link 
                  to="/profile" 
                  className={`text-sm font-medium ${location.pathname === '/profile' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Profile
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </nav>
            )}
          </header>
        )}
        <main className="container py-6 md:py-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
