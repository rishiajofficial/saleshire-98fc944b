
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
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
  is_public: boolean;
  selectedAssessment?: string | null;
  selectedModules?: string[];
}

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("jobs")
        .select("*");
      
      // If we have a company ID, filter jobs by the company's users
      if (profile?.company_id) {
        const { data: companyUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('company_id', profile.company_id);
          
        if (companyUsers && companyUsers.length > 0) {
          const userIds = companyUsers.map(user => user.id);
          query = query.in('created_by', userIds);
        }
      }

      const { data: jobsData, error: jobsError } = await query.order("created_at", { ascending: false });

      if (jobsError) throw jobsError;

      // Get assessments for each job
      const jobIds = jobsData?.map((job) => job.id) || [];
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
          .from("job_training")
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
      const enhancedJobs: Job[] = jobsData!.map((job) => ({
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
        .insert([{ 
          ...jobDetails, 
          created_by: user.id,
          is_public: jobDetails.is_public || false 
        }])
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
          training_module_id: moduleId,
        }));

        const { error: modulesError } = await supabase
          .from("job_training")
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
        .update({
          ...jobDetails,
          is_public: jobDetails.is_public || false
        })
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
      await supabase.from("job_training").delete().eq("job_id", id);

      // Create associated modules if any
      if (selectedModules && selectedModules.length > 0) {
        const moduleInserts = selectedModules.map((moduleId) => ({
          job_id: id,
          training_module_id: moduleId,
        }));

        const { error: modulesError } = await supabase
          .from("job_training")
          .insert(moduleInserts);

        if (modulesError) throw modulesError;
      }

      toast.success("Job updated successfully");
      await fetchJobs();
      return true;
    } catch (error: any) {
      console.error("Error updating job:", error);
      toast.error(`Failed to update job: ${error.message}`);
      return false;
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      // First, delete related records from join tables
      const { error: jobAssessmentsError } = await supabase
        .from("job_assessments")
        .delete()
        .eq("job_id", jobId);
      
      if (jobAssessmentsError) {
        console.error("Error deleting job assessments:", jobAssessmentsError);
      }

      const { error: jobTrainingError } = await supabase
        .from("job_training")
        .delete()
        .eq("job_id", jobId);
      
      if (jobTrainingError) {
        console.error("Error deleting job training:", jobTrainingError);
      }
      
      const { error: jobAppsError } = await supabase
        .from("job_applications")
        .delete()
        .eq("job_id", jobId);
      
      if (jobAppsError) {
        console.error("Error deleting job applications:", jobAppsError);
      }
      
      // Now delete the job itself
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      // Update local state by removing the deleted job
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      toast.success("Job deleted successfully");
      return true;
    } catch (error: any) {
      console.error("Error deleting job:", error);
      toast.error(`Failed to delete job: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [profile?.company_id]);

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
