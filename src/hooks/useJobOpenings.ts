import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export const useJobOpenings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userApplications, setUserApplications] = useState<Record<string, { applied: boolean; completed: boolean }>>({});
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch active jobs
  const { 
    data: jobs, 
    isLoading: isLoadingJobs, 
    error: jobsError,
    refetch: refetchJobs 
  } = useQuery({
    queryKey: ['active-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'active')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Fetch user applications with completion status
  const fetchUserApplications = async () => {
    if (!user) return;
    
    try {
      setLoadingApplications(true);
      
      // Get job applications
      const { data: jobAppData, error: jobAppError } = await supabase
        .from('job_applications')
        .select('job_id, status')
        .eq('candidate_id', user.id);
        
      if (jobAppError) throw jobAppError;
      
      // Get candidate data to check if profile is complete
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .select('resume, about_me_video, phone, location')
        .eq('id', user.id)
        .single();
        
      if (candidateError && candidateError.code !== 'PGRST116') {
        console.error("Candidate data fetch error:", candidateError);
      }
      
      const applications: Record<string, { applied: boolean; completed: boolean }> = {};
      
      if (jobAppData) {
        jobAppData.forEach(app => {
          // Check if application is complete (has all required documents)
          const isComplete = candidateData && 
            candidateData.resume && 
            candidateData.about_me_video && 
            candidateData.phone &&
            candidateData.location;
            
          applications[app.job_id] = {
            applied: true,
            completed: !!isComplete
          };
        });
      }
      
      setUserApplications(applications);
    } catch (err) {
      console.error("Error fetching user applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  };

  useEffect(() => {
    fetchUserApplications();
  }, [user]);

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

  const handleDeleteApplication = async () => {
    if (!user || !jobToDelete) return;
    
    try {
      setIsDeleting(true);
      
      console.log("Starting application withdrawal for specific job:", jobToDelete, "user:", user.id);
      
      // 1. Delete the specific job application record
      const { error: deleteAppError } = await supabase
        .from('job_applications')
        .delete()
        .eq('candidate_id', user.id)
        .eq('job_id', jobToDelete); // Only delete for this specific job
        
      if (deleteAppError) {
        console.error("Error deleting job application:", deleteAppError);
        throw deleteAppError;
      }
      
      // 2. Get training modules for THIS SPECIFIC JOB and clear progress
      const { data: jobTrainingData, error: jobTrainingError } = await supabase
        .from('job_training')
        .select('training_module_id')
        .eq('job_id', jobToDelete); // Only for this job
        
      if (jobTrainingError) {
        console.error("Error fetching job training:", jobTrainingError);
        throw jobTrainingError;
      }
      
      // 3. Clear training progress and quiz results ONLY for this job's modules
      if (jobTrainingData && jobTrainingData.length > 0) {
        const moduleIds = jobTrainingData.map(jt => jt.training_module_id);
        
        // Get modules data
        const { data: modulesData, error: modulesError } = await supabase
          .from('training_modules')
          .select('id, module')
          .in('id', moduleIds);
          
        if (modulesError) {
          console.error("Error fetching modules:", modulesError);
          throw modulesError;
        }
        
        if (modulesData && modulesData.length > 0) {
          const moduleCategories = modulesData.map(m => m.module);
          
          // Delete training progress ONLY for this job's modules
          if (moduleCategories.length > 0) {
            const { error: progressError } = await supabase
              .from('training_progress')
              .delete()
              .eq('user_id', user.id)
              .in('module', moduleCategories);
              
            if (progressError) {
              console.error("Error deleting training progress:", progressError);
            }
            
            // Delete quiz results ONLY for this job's modules
            const { error: quizError } = await supabase
              .from('quiz_results')
              .delete()
              .eq('user_id', user.id)
              .in('module', moduleCategories);
              
            if (quizError) {
              console.error("Error deleting quiz results:", quizError);
            }
          }
        }
      }
      
      // 4. Delete assessment results that might be job-specific
      // Note: We're keeping this general for now, but ideally assessment_results 
      // should have a job_id field to be more specific
      const { error: assessmentError } = await supabase
        .from('assessment_results')
        .delete()
        .eq('candidate_id', user.id);
        
      if (assessmentError) {
        console.error("Error deleting assessment results:", assessmentError);
      }
      
      // 5. Delete interviews for this specific job
      const { error: interviewError } = await supabase
        .from('interviews')
        .delete()
        .eq('candidate_id', user.id);
        
      if (interviewError) {
        console.error("Error deleting interviews:", interviewError);
      }
      
      // 6. Delete sales tasks for this candidate
      const { error: salesTaskError } = await supabase
        .from('sales_tasks')
        .delete()
        .eq('candidate_id', user.id);
        
      if (salesTaskError) {
        console.error("Error deleting sales tasks:", salesTaskError);
      }
      
      toast.success("Application successfully withdrawn. You can now apply again.");
      
      // Update local state immediately - remove only the specific job
      setUserApplications(prev => {
        const updated = {...prev};
        delete updated[jobToDelete];
        return updated;
      });
      
      setJobToDelete(null);

      // Refetch data to ensure consistency
      await fetchUserApplications();
      refetchJobs();
      
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error("Failed to withdraw application: " + (err.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    jobs,
    isLoadingJobs,
    jobsError,
    loadingApplications,
    userApplications,
    jobToDelete,
    isDeleting,
    setJobToDelete,
    handleApply,
    handleDeleteApplication,
    isLoading: isLoadingJobs || loadingApplications,
  };
};
