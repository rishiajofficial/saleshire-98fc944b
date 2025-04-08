
import React from "react";
import MainLayout from "@/components/layout/MainLayout";

const HRDashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage candidates and review applications
          </p>
        </div>
        
        <div className="bg-muted/40 p-8 rounded-xl text-center">
          <h2 className="text-xl font-medium mb-3">Welcome to the HR Dashboard</h2>
          <p>This dashboard is under development. Check back soon for more features.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default HRDashboard;
