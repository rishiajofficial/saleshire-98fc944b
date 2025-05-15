
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sideContent: React.ReactNode;
}

export const DashboardLayout = ({ children, sideContent }: DashboardLayoutProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 space-y-6">
        {children}
      </div>
      <div className="md:col-span-4 space-y-6">
        {sideContent}
      </div>
    </div>
  );
};
