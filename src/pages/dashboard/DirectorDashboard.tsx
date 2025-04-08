
import React from "react";
import MainLayout from "@/components/layout/MainLayout";

const DirectorDashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Director Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage department activities and review performance metrics
          </p>
        </div>
        
        <div className="bg-muted/40 p-8 rounded-xl text-center">
          <h2 className="text-xl font-medium mb-3">Welcome to the Director Dashboard</h2>
          <p>This dashboard is under development. Check back soon for more features.</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default DirectorDashboard;
