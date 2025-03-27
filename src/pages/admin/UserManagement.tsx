
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const UserManagement = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Advanced user management and permissions
            </p>
          </div>
          <Button asChild>
            <Link to="/dashboard/admin">Back to Admin Dashboard</Link>
          </Button>
        </div>
        
        <div className="py-12 text-center">
          <p className="text-muted-foreground">All user management options are available on the Admin Dashboard.</p>
          <Button asChild className="mt-4">
            <Link to="/dashboard/admin">Go to Admin Dashboard</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserManagement;
