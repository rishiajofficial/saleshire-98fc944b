
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

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
  
  console.log("ProtectedRoute - Current profile:", profile);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  
  // Special case for admin route and admin user
  const isAdminRoute = location.pathname === '/dashboard/admin';
  const isAdminEmail = user?.email === 'admin@example.com';
  
  // Save current path for redirect after login
  useEffect(() => {
    if (!user && !isLoading) {
      // Store the attempted URL for redirecting after login
      sessionStorage.setItem('intendedPath', location.pathname);
    }
  }, [user, isLoading, location.pathname]);
  
  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  // Special case for admin@example.com - always allow access to admin dashboard
  if (isAdminRoute && isAdminEmail) {
    return <>{children}</>;
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Special admin case - if not using the special admin route logic above
  if (user.email === 'admin@example.com' && !profile) {
    // For admin users, we'll proceed even without a profile
    if (isAdminRoute) {
      return <>{children}</>;
    } else {
      return <Navigate to="/dashboard/admin" replace />;
    }
  }
  
  // Check if profile is loaded
  if (!profile) {
    console.log("Profile not loaded yet but user is authenticated");
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  console.log("User role:", profile.role);
  console.log("Is role allowed:", allowedRoles.includes(profile.role as UserRole));
  
  // If profile is loaded and role is not allowed, redirect to appropriate dashboard
  if (!allowedRoles.includes(profile.role as UserRole)) {
    console.log("Redirecting to correct dashboard based on role:", profile.role);
    if (profile.role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    } else if (profile.role === 'manager' || profile.role === 'hr' || profile.role === 'director') {
      return <Navigate to="/dashboard/manager" replace />;
    } else {
      return <Navigate to="/dashboard/candidate" replace />;
    }
  }
  
  // If everything is fine, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
