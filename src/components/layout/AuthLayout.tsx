
import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="py-4 border-b border-border/30">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.ico" alt="HireSmart Logo" className="h-8 w-8" />
            <span className="font-bold text-xl">HireSmart</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        <div className="py-8 mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <footer className="py-6 border-t border-border/30">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sales Hiring & Training System
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
