import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { useJobOpenings } from "@/hooks/useJobOpenings";
import PublicJobListings from "@/components/public/PublicJobListings";

export default function Careers() {
  const { jobs, loading } = useJobOpenings();
  
  return (
    <MainLayout title="Careers">
      <div className="container mx-auto py-12 px-4 md:px-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Join our team</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore job opportunities and find the role that's right for you.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <PublicJobListings 
            jobs={jobs} 
            isLoading={loading}  // Changed prop name from loading to isLoading
          />
        </div>
      </div>
    </MainLayout>
  );
}
