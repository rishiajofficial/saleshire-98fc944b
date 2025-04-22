
import React from "react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const JobOpenings = () => {
  const navigate = useNavigate();

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['active-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleApply = async (jobId: string) => {
    try {
      // Store the selected job ID
      localStorage.setItem("selectedJob", jobId);
      navigate("/application");
    } catch (error) {
      console.error("Error applying for job:", error);
      toast.error("Failed to apply for job");
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <div className="text-center text-red-600">
            Failed to load job openings. Please try again later.
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12">
        <h2 className="text-3xl font-bold mb-8">Job Openings</h2>
        {jobs && jobs.length > 0 ? (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div key={job.id} className="border rounded-lg px-6 py-4 shadow-sm bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg">{job.title}</div>
                    <div className="text-gray-600 text-sm">{job.description}</div>
                  </div>
                  <Button onClick={() => handleApply(job.id)}>
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No job openings available at the moment.
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default JobOpenings;
