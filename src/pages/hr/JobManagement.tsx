
import React, { useEffect, useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import JobCreationDialog from '@/components/jobs/JobCreationDialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import JobList from '@/components/jobs/JobList';
import { Job } from '@/types/job';

const JobManagementPage = () => {
  const { jobs, loading, error, fetchJobs, createJob, updateJob, deleteJob } = useJobs();
  const [assessments, setAssessments] = useState<{ id: string; title: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  
  useEffect(() => {
    fetchJobs();
    fetchAssessments();
    fetchCategories();
  }, []);
  
  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, title');
      
      if (error) throw error;
      setAssessments(data || []);
    } catch (err: any) {
      toast.error(`Failed to fetch assessments: ${err.message}`);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('training_categories')
        .select('id, name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      toast.error(`Failed to fetch categories: ${err.message}`);
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
      await deleteJob(jobId);
      toast.success("Job deleted successfully!");
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
        // Make sure required properties in EditingJob have default values if they're optional in Job
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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Job Management</h1>
        <JobCreationDialog 
          onJobCreated={handleJobCreated}
          assessments={assessments}
          categories={categories}
        />
      </div>
      
      <JobList 
        jobs={jobs}
        onJobDeleted={handleJobDeleted}
        onJobUpdated={handleJobUpdated}
        onJobArchived={handleJobArchived}
        assessments={assessments}
        categories={categories}
      />
    </div>
  );
};

export default JobManagementPage;
