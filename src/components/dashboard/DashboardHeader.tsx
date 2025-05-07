
import React from 'react';
import { UserRole } from '@/types';

interface DashboardHeaderProps {
  userName?: string | null;
  userRole?: UserRole | null;
}

export const DashboardHeader = ({ userName, userRole }: DashboardHeaderProps) => {
  // Map role to dashboard name
  const getDashboardTitle = (role?: UserRole | null) => {
    if (!role) return 'Dashboard';
    
    switch (role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'manager':
        return 'Manager Dashboard';
      case 'hr':
        return 'HR Dashboard';
      case 'director':
        return 'Director Dashboard';
      case 'candidate':
      default:
        return 'Candidate Dashboard';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{getDashboardTitle(userRole)}</h1>
      <p className="text-muted-foreground mt-2">
        Welcome back, {userName || 'User'}
      </p>
    </div>
  );
};
