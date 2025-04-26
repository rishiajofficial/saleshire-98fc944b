
import React from 'react';

interface DashboardHeaderProps {
  userName?: string | null;
}

export const DashboardHeader = ({ userName }: DashboardHeaderProps) => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Candidate Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Welcome back, {userName || 'Candidate'}
      </p>
    </div>
  );
};
