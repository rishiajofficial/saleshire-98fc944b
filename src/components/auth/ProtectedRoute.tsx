
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Loading from '@/components/ui/loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  const [waitingForProfile, setWaitingForProfile] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Save current path for redirect after login
  useEffect(() => {
    if (!user && !isLoading) {
      sessionStorage.setItem('intendedPath', location.pathname);
    }
  }, [user, isLoading, location.pathname]);
  
  // Set a timeout to prevent infinite loading if profile fetch fails
  useEffect(() => {
    if (user && !profile) {
      const timer = setTimeout(() => {
        setWaitingForProfile(false);
        console.log("ProtectedRoute: Profile fetch timeout reached");
      }, 5000); // Wait 5 seconds max for profile
      
      return () => clearTimeout(timer);
    } else {
      setWaitingForProfile(false);
    }
  }, [user, profile]);
  
  // Handle errors from initial loads
  useEffect(() => {
    const handleErrors = async () => {
      if (user && !profile && !waitingForProfile) {
        // After timeout, if still no profile, try a direct fetch 
        try {
          console.log("ProtectedRoute: Attempting direct profile fetch");
          
          const { supabase } = await import('@/integrations/supabase/client');
          
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("ProtectedRoute: Direct profile fetch error:", error.message);
            setErrorMessage(error.message);
          } else if (data) {
            console.log("ProtectedRoute: Direct profile fetch succeeded, but AuthContext profile is missing. Using fallback access.");
          }
        } catch (err) {
          console.error("ProtectedRoute: Error in direct profile fetch:", err);
        }
      }
    };
    
    handleErrors();
  }, [user, profile, waitingForProfile]);
  
  // Show loading state
  if (isLoading) {
    return <Loading message="Loading application..." />;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If profile is not loaded yet but user is authenticated and still waiting
  if (!profile && waitingForProfile) {
    return <Loading message="Loading profile data..." subMessage="Please wait while we load your profile information" />;
  }
  
  // If there's an error loading profile but user is authenticated (after timeout)
  if (!profile && !waitingForProfile) {
    // Log detailed information about the state
    console.log("ProtectedRoute: Using fallback access. Profile missing but user authenticated:", {
      userId: user?.id,
      errorMessage,
      allowedRoles
    });
    
    // Show a fallback UI for profile loading error
    toast.error("Could not load profile data. Using basic access.");
    
    // Provide basic access to pages that don't strictly require role validation
    if (allowedRoles.includes('candidate' as UserRole)) {
      return <>{children}</>;
    } else {
      return <Navigate to="/dashboard/candidate" replace />;
    }
  }
  
  // If profile is loaded and role is not allowed, redirect to appropriate dashboard
  if (profile && !allowedRoles.includes(profile.role as UserRole)) {
    if (profile.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (profile.role === 'manager') {
      return <Navigate to="/dashboard/manager" replace />;
    } else if (profile.role === 'director') {
      return <Navigate to="/dashboard/director" replace />;
    } else if (profile.role === 'hr') {
      return <Navigate to="/dashboard/hr" replace />;
    } else {
      return <Navigate to="/dashboard/candidate" replace />;
    }
  }
  
  // If everything is fine, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
