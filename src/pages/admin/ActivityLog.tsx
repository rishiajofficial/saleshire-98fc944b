
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ActivityLog = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-muted-foreground mt-2">
              Complete history of system activities
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/admin">Back to Admin Dashboard</Link>
          </Button>
        </div>
        
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Activity log data is available on the Admin Dashboard.</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard/admin">Go to Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ActivityLog;
