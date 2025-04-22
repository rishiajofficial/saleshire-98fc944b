import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, ChevronDown, LogOut, User } from "lucide-react";
import { NavItem } from "./nav-items";

interface DesktopNavProps {
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (value: boolean) => void;
  activeDropdowns: string[];
  toggleDropdown: (label: string) => void;
  navItems: NavItem[];
  profile?: { name?: string; role?: string };
  pathname: string;
  handleSignOut: () => void;
}

export const DesktopNav = ({
  isSidebarExpanded,
  setIsSidebarExpanded,
  activeDropdowns,
  toggleDropdown,
  navItems,
  profile,
  pathname,
  handleSignOut,
}: DesktopNavProps) => {
  return (
    <div className={`fixed z-20 ${isSidebarExpanded ? 'w-64' : 'w-20'} transition-all duration-300 border-r h-screen bg-background hidden lg:block`}>
      <div className="flex flex-col h-full">
        <div className="p-6 flex items-center gap-2 justify-between">
          {isSidebarExpanded && (
            <div className="font-bold text-lg">WorkForce</div>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="ml-auto"
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2 px-4">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const isActive = 
                item.href === pathname || 
                (item.href === "/dashboard/admin" && pathname.includes("/dashboard") && profile?.role === "admin") ||
                (item.href === "/dashboard/manager" && pathname.includes("/dashboard") && profile?.role === "manager") ||
                (item.href === "/dashboard/hr" && pathname.includes("/dashboard") && profile?.role === "hr") ||
                (item.href === "/dashboard/director" && pathname.includes("/dashboard") && profile?.role === "director") ||
                (item.href === "/dashboard/candidate" && pathname.includes("/dashboard") && profile?.role === "candidate");
              
              const isDropdownActive = activeDropdowns.includes(item.label);
              const hasSubitems = item.subitems && item.subitems.length > 0;

              if (hasSubitems) {
                return (
                  <div key={item.label}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${isDropdownActive ? "bg-muted" : ""}`}
                      onClick={() => toggleDropdown(item.label)}
                    >
                      {item.icon}
                      {isSidebarExpanded && <span className="ml-2">{item.label}</span>}
                      {isSidebarExpanded && (
                        <div className="ml-auto">
                          {isDropdownActive ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      )}
                    </Button>
                    {isDropdownActive && isSidebarExpanded && item.subitems && (
                      <div className="pl-4 mt-1 grid gap-1">
                        {item.subitems.map((subitem) => {
                          const isSubitemActive = subitem.href === pathname;
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
                    {isSidebarExpanded && <span className="ml-2">{item.label}</span>}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t mt-auto">
          {isSidebarExpanded ? (
            <>
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
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback>
                  {profile?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
