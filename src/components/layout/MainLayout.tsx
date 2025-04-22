import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Users,
  BarChart3,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  Video,
  User,
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  role: string[];
  badge?: string;
  subitems?: NavItem[];
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeDropdowns, setActiveDropdowns] = useState<string[]>([]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

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

  const isDashboardActive = [
    "/dashboard/admin",
    "/dashboard/manager",
    "/dashboard/candidate",
    "/dashboard/hr",
    "/dashboard/director",
  ].includes(location.pathname);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: profile?.role === "admin"
        ? "/dashboard/admin"
        : profile?.role === "manager"
        ? "/dashboard/manager"
        : profile?.role === "hr"
        ? "/dashboard/hr"
        : profile?.role === "director"
        ? "/dashboard/director"
        : "/dashboard/candidate",
      icon: <Home className="h-5 w-5" />,
      role: ["admin", "manager", "candidate", "hr", "director"],
    },
    {
      label: "Candidates",
      href: "/candidates",
      icon: <Users className="h-5 w-5" />,
      role: ["admin", "manager", "hr", "director"],
    },
    {
      label: "Assessments",
      href: "/assessments",
      icon: <FileText className="h-5 w-5" />,
      role: ["admin", "manager", "hr", "director"],
    },
    {
      label: "Interviews",
      href: "/interviews",
      icon: <Video className="h-5 w-5" />,
      role: ["admin", "manager", "hr", "director"],
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      role: ["admin", "manager", "hr", "director"],
    },
    {
      label: "Training",
      href: "/training",
      icon: <BookOpen className="h-5 w-5" />,
      role: ["candidate"],
    },
    {
      label: "Job Openings",
      href: "/job-openings",
      icon: <FileText className="h-5 w-5" />,
      role: ["candidate"],
    },
    {
      label: "Admin Tools",
      href: "#",
      icon: <Settings className="h-5 w-5" />,
      role: ["admin"],
      subitems: [
        {
          label: "User Management",
          href: "/users",
          icon: <Users className="h-5 w-5" />,
          role: ["admin"],
        },
        {
          label: "Activity Log",
          href: "/activity-log",
          icon: <FileText className="h-5 w-5" />,
          role: ["admin"],
        },
        {
          label: "Training Management",
          href: "/training-management",
          icon: <BookOpen className="h-5 w-5" />,
          role: ["admin"],
        },
      ],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.role.includes(profile?.role || "")
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Navigation */}
      {isMobile ? (
        <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {profile?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{profile?.name || "User"}</span>
                        <span className="text-xs text-muted-foreground">
                          {profile?.role?.charAt(0).toUpperCase() +
                            profile?.role?.slice(1) || "User"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto py-2">
                    <nav className="grid gap-1 px-2">
                      {filteredNavItems.map((item) => {
                        const isActive = item.href === location.pathname;
                        const isDropdownActive = activeDropdowns.includes(item.label);
                        const hasSubitems = item.subitems && item.subitems.length > 0;

                        if (hasSubitems) {
                          return (
                            <div key={item.label}>
                              <Button
                                variant="ghost"
                                className={`w-full justify-start ${
                                  isDropdownActive ? "bg-muted" : ""
                                }`}
                                onClick={() => toggleDropdown(item.label)}
                              >
                                {item.icon}
                                <span className="ml-2">{item.label}</span>
                                <div className="ml-auto">
                                  {isDropdownActive ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                              </Button>
                              {isDropdownActive && item.subitems && (
                                <div className="pl-4 mt-1 grid gap-1">
                                  {item.subitems.map((subitem) => {
                                    const isSubitemActive =
                                      subitem.href === location.pathname;
                                    return (
                                      <Button
                                        key={subitem.label}
                                        variant={isSubitemActive ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        onClick={() => {
                                          navigate(subitem.href);
                                          setIsOpen(false);
                                        }}
                                      >
                                        {subitem.icon}
                                        <span className="ml-2">{subitem.label}</span>
                                      </Button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <Button
                            key={item.label}
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => {
                              navigate(item.href);
                              setIsOpen(false);
                            }}
                          >
                            {item.icon}
                            <span className="ml-2">{item.label}</span>
                          </Button>
                        );
                      })}
                    </nav>
                  </div>
                  <div className="p-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="ml-2">Sign Out</span>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="font-bold text-lg">Sales Training Portal</div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{profile?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.role?.charAt(0).toUpperCase() +
                        profile?.role?.slice(1) || "User"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-500 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      ) : (
        <div className="fixed z-30 w-64 border-r h-screen bg-background hidden lg:block">
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center gap-2">
              <div className="font-bold text-lg">Sales Training Portal</div>
            </div>
            <div className="flex-1 overflow-auto py-2 px-4">
              <nav className="grid gap-1">
                {filteredNavItems.map((item) => {
                  const isActive = 
                    item.href === location.pathname || 
                    (item.href === "/dashboard/admin" && isDashboardActive && profile?.role === "admin") ||
                    (item.href === "/dashboard/manager" && isDashboardActive && profile?.role === "manager") ||
                    (item.href === "/dashboard/hr" && isDashboardActive && profile?.role === "hr") ||
                    (item.href === "/dashboard/director" && isDashboardActive && profile?.role === "director") ||
                    (item.href === "/dashboard/candidate" && isDashboardActive && profile?.role === "candidate");
                  
                  const isDropdownActive = activeDropdowns.includes(item.label);
                  const hasSubitems = item.subitems && item.subitems.length > 0;

                  if (hasSubitems) {
                    return (
                      <div key={item.label}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            isDropdownActive ? "bg-muted" : ""
                          }`}
                          onClick={() => toggleDropdown(item.label)}
                        >
                          {item.icon}
                          <span className="ml-2">{item.label}</span>
                          <div className="ml-auto">
                            {isDropdownActive ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </Button>
                        {isDropdownActive && item.subitems && (
                          <div className="pl-4 mt-1 grid gap-1">
                            {item.subitems.map((subitem) => {
                              const isSubitemActive =
                                subitem.href === location.pathname;
                              return (
                                <Button
                                  key={subitem.label}
                                  variant={isSubitemActive ? "secondary" : "ghost"}
                                  className="w-full justify-start"
                                  asChild
                                >
                                  <Link to={subitem.href}>
                                    {subitem.icon}
                                    <span className="ml-2">{subitem.label}</span>
                                  </Link>
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Button
                      key={item.label}
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to={item.href}>
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t mt-auto">
              <div className="flex items-center gap-3 mb-4">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {profile?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{profile?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">
                    {profile?.role?.charAt(0).toUpperCase() +
                      profile?.role?.slice(1) || "User"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 ${isMobile ? "pt-16" : "lg:pl-64"}`}>
        <main className="container py-6 md:py-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
