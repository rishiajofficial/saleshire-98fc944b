
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Job {
  id: string;
  title: string;
  description: string;
  department?: string;
  location?: string;
  employment_type?: string;
  status: string;
  salary_range?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived: boolean;
  selectedAssessment?: string | null;
  selectedModules?: string[];
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Get assessments for each job
      const jobIds = data?.map((job) => job.id) || [];
      let jobAssessments: Record<string, string> = {};
      let jobModules: Record<string, string[]> = {};

      if (jobIds.length > 0) {
        // Fetch job assessments
        const { data: assessmentsData, error: assessmentsError } = await supabase
          .from("job_assessments")
          .select("job_id, assessment_id")
          .in("job_id", jobIds);

        if (assessmentsError) throw assessmentsError;

        // Map assessments to jobs
        assessmentsData?.forEach((ja) => {
          jobAssessments[ja.job_id] = ja.assessment_id;
        });

        // Fetch job training modules
        const { data: modulesData, error: modulesError } = await supabase
          .from("job_training")  // Fix: changed from job_modules to job_training
          .select("job_id, training_module_id")
          .in("job_id", jobIds);

        if (modulesError) throw modulesError;

        // Map modules to jobs
        modulesData?.forEach((jm) => {
          if (!jobModules[jm.job_id]) {
            jobModules[jm.job_id] = [];
          }
          jobModules[jm.job_id].push(jm.training_module_id);
        });
      }

      // Enhance jobs with assessments and modules
      const enhancedJobs: Job[] = data!.map((job) => ({
        ...job,
        selectedAssessment: jobAssessments[job.id] || null,
        selectedModules: jobModules[job.id] || [],
      }));

      setJobs(enhancedJobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      setError(`Failed to fetch jobs: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData: any) => {
    try {
      if (!user) {
        toast.error("You must be logged in to create a job");
        return null;
      }

      // Extract modules and assessment from job data
      const { selectedModules, selectedAssessment, ...jobDetails } = jobData;

      // Create job record
      const { data, error } = await supabase
        .from("jobs")
        .insert([{ ...jobDetails, created_by: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Create associated assessment if any
      if (selectedAssessment) {
        const { error: assessmentError } = await supabase
          .from("job_assessments")
          .insert([
            { job_id: data.id, assessment_id: selectedAssessment },
          ]);

        if (assessmentError) throw assessmentError;
      }

      // Create associated modules if any
      if (selectedModules && selectedModules.length > 0) {
        const moduleInserts = selectedModules.map((moduleId) => ({
          job_id: data.id,
          training_module_id: moduleId,  // Fix: changed from module_id to training_module_id
        }));

        const { error: modulesError } = await supabase
          .from("job_training")  // Fix: changed from job_modules to job_training
          .insert(moduleInserts);

        if (modulesError) throw modulesError;
      }

      toast.success("Job created successfully");
      fetchJobs();
      return data;
    } catch (error: any) {
      console.error("Error creating job:", error);
      toast.error(`Failed to create job: ${error.message}`);
      return null;
    }
  };

  const updateJob = async (jobData: any) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update a job");
        return null;
      }

      // Extract modules and assessment from job data
      const { id, selectedModules, selectedAssessment, ...jobDetails } = jobData;

      // Update job record
      const { error } = await supabase
        .from("jobs")
        .update(jobDetails)
        .eq("id", id);

      if (error) throw error;

      // Handle assessment - first delete existing
      await supabase.from("job_assessments").delete().eq("job_id", id);

      // Create associated assessment if any
      if (selectedAssessment) {
        const { error: assessmentError } = await supabase
          .from("job_assessments")
          .insert([{ job_id: id, assessment_id: selectedAssessment }]);

        if (assessmentError) throw assessmentError;
      }

      // Handle modules - first delete existing
      await supabase.from("job_training").delete().eq("job_id", id);  // Fix: changed from job_modules to job_training

      // Create associated modules if any
      if (selectedModules && selectedModules.length > 0) {
        const moduleInserts = selectedModules.map((moduleId) => ({
          job_id: id,
          training_module_id: moduleId,  // Fix: changed from module_id to training_module_id
        }));

        const { error: modulesError } = await supabase
          .from("job_training")  // Fix: changed from job_modules to job_training
          .insert(moduleInserts);

        if (modulesError) throw modulesError;
      }

      toast.success("Job updated successfully");
      fetchJobs();
      return true;
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast.error(`Failed to update job: ${error.message}`);
      return false;
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      // Delete related job applications and other dependencies via database function
      const { error: deleteError } = await supabase.rpc('delete_job_applications', {
        job_id: jobId
      });
      
      if (deleteError) throw deleteError;
      
      // Delete the job itself
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      toast.success("Job deleted successfully");
      fetchJobs();
      return true;
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast.error(`Failed to delete job: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    loading,
    error,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
  };
};
