
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [] 
}) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  
  // Save current path for redirect after login - only do this once when determined not logged in
  useEffect(() => {
    if (!user && !isLoading) {
      // Store the attempted URL for redirecting after login, but only if it's not a public route
      if (!['/login', '/register', '/forgot-password', '/reset-password', '/', '/careers'].includes(location.pathname)) {
        sessionStorage.setItem('intendedPath', location.pathname);
      }
    }
  }, [user, isLoading, location.pathname]);
  
  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if profile is loaded
  if (!profile) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  // If profile is loaded and allowedRoles is provided but role is not allowed, redirect to appropriate dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role as UserRole)) {
    const dashboardPath = `/dashboard/${profile.role}`;
    return <Navigate to={dashboardPath} replace />;
  }
  
  // If everything is fine, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
