
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth";
import { BarChart, LogOut } from "lucide-react";
import { toast } from "sonner";

const CandidateNavbar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <nav className="container px-4 mx-auto max-w-full">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/dashboard/candidate" className="flex items-center space-x-2">
            <BarChart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <span className="text-lg sm:text-xl font-semibold tracking-tight">
              SalesHire
            </span>
          </Link>

          {/* Logout Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Logout</span>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default CandidateNavbar;
