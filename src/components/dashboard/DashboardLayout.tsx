
import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sideContent?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  sideContent 
}) => {
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-background">
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      
      {sideContent && (
        <aside className="w-full md:w-80 lg:w-96 border-l border-border bg-card p-4 md:p-6 overflow-y-auto">
          {sideContent}
        </aside>
      )}
    </div>
  );
};
