
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
      }, 5000); // Wait 5 seconds max for profile
      
      return () => clearTimeout(timer);
    } else {
      setWaitingForProfile(false);
    }
  }, [user, profile]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading application...</p>
      </div>
    );
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If profile is not loaded yet but user is authenticated and still waiting
  if (!profile && waitingForProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile data...</p>
      </div>
    );
  }
  
  // If there's an error loading profile but user is authenticated (after timeout)
  if (!profile && !waitingForProfile) {
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
