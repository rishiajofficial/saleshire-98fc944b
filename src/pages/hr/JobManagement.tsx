
import React, { useEffect, useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import JobCreationDialog from '@/components/jobs/JobCreationDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import JobList from '@/components/jobs/JobList';
import { Job } from '@/types/job';
import MainLayout from '@/components/layout/MainLayout';

const JobManagementPage = () => {
  const { jobs, loading, error, fetchJobs, createJob, updateJob, deleteJob } = useJobs();
  const [assessments, setAssessments] = useState<{ id: string; title: string }[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchJobs();
    fetchAssessments();
  }, []);
  
  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title')
        .eq('archived', false);
      
      if (error) throw error;
      setAssessments(data || []);
    } catch (err: any) {
      toast.error(`Failed to fetch assessments: ${err.message}`);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center h-96">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    </div>;
  }

  if (error) {
    return <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
      Error: {error}
    </div>;
  }

  const handleJobCreated = async (jobData: any) => {
    try {
      await createJob(jobData);
      toast.success("Job created successfully!");
      setIsCreateDialogOpen(false);
    } catch (err: any) {
      toast.error(`Failed to create job: ${err.message}`);
    }
  };

  const handleJobUpdated = async (jobData: any) => {
    try {
      await updateJob(jobData);
      toast.success("Job updated successfully!");
    } catch (err: any) {
      toast.error(`Failed to update job: ${err.message}`);
    }
  };

  const handleJobDeleted = async (jobId: string) => {
    try {
      const result = await deleteJob(jobId);
      if (result) {
        toast.success("Job deleted successfully!");
      }
    } catch (err: any) {
      toast.error(`Failed to delete job: ${err.message}`);
    }
  };
  
  const handleJobArchived = async (jobId: string, archived: boolean) => {
    try {
      // Get the job to update
      const jobToUpdate = jobs.find(job => job.id === jobId);
      if (!jobToUpdate) {
        toast.error("Job not found");
        return;
      }
      
      // Ensure all required properties are present in the job data
      const updatedJob = {
        ...jobToUpdate,
        archived,
        department: jobToUpdate.department || "",
        location: jobToUpdate.location || "",
        employment_type: jobToUpdate.employment_type || "",
        salary_range: jobToUpdate.salary_range || "",
        selectedAssessment: jobToUpdate.selectedAssessment || null,
        selectedModules: jobToUpdate.selectedModules || []
      };
      
      await updateJob(updatedJob);
      toast.success(`Job ${archived ? "archived" : "unarchived"} successfully!`);
    } catch (err: any) {
      toast.error(`Failed to update job: ${err.message}`);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Management</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>Create New Job</Button>
        </div>
        
        <JobList 
          jobs={jobs}
          onJobDeleted={handleJobDeleted}
          onJobUpdated={handleJobUpdated}
          onJobArchived={handleJobArchived}
          assessments={assessments}
          categories={[]} // Pass empty array for categories since job_categories table was removed
        />

        <JobCreationDialog 
          onJobCreated={handleJobCreated}
          assessments={assessments}
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      </div>
    </MainLayout>
  );
};

export default JobManagementPage;
