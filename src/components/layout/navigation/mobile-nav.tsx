
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "./nav-items";

interface MobileNavProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  activeDropdowns: string[];
  toggleDropdown: (label: string) => void;
  navItems: NavItem[];
  profile?: { name?: string; role?: string };
  pathname: string;
  onNavigate: (to: string) => void;
}

export const MobileNav = ({
  isOpen,
  setIsOpen,
  activeDropdowns,
  toggleDropdown,
  navItems,
  profile,
  pathname,
  onNavigate,
}: MobileNavProps) => {
  return (
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
              {navItems.map((item) => {
                const isActive = item.href === pathname;
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
                            const isSubitemActive = subitem.href === pathname;
                            return (
                              <Button
                                key={subitem.label}
                                variant={isSubitemActive ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => {
                                  onNavigate(subitem.href);
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
                      onNavigate(item.href);
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
