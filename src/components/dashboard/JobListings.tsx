
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Job } from '@/types/job';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";

const JobListings = () => {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['activeJobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Job[];
    }
  });

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold">Active Job Openings</CardTitle>
          <CardDescription>Currently active job positions</CardDescription>
        </div>
        <Button asChild>
          <Link to="/hr/job-management">
            <Briefcase className="mr-2 h-4 w-4" />
            Manage Jobs
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {jobs?.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/hr/job-management">View Details</Link>
              </Button>
            </div>
          ))}
          {!jobs?.length && (
            <p className="text-center text-muted-foreground py-4">
              No active job openings
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JobListings;
