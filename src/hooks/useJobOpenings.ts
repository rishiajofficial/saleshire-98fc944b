
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useJobOpenings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userApplications, setUserApplications] = useState<Record<string, boolean>>({});
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

  // Fetch user applications
  useEffect(() => {
    const fetchUserApplications = async () => {
      if (!user) return;
      
      try {
        setLoadingApplications(true);
        const { data, error } = await supabase
          .from('job_applications')
          .select('job_id, status')
          .eq('candidate_id', user.id);
          
        if (error) throw error;
        
        const applications: Record<string, boolean> = {};
        if (data) {
          data.forEach(app => {
            applications[app.job_id] = true;
          });
        }
        
        setUserApplications(applications);
      } catch (err) {
        console.error("Error fetching user applications:", err);
      } finally {
        setLoadingApplications(false);
      }
    };
    
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
      
      // First, get the training modules associated with this job
      const { data: jobTrainingData, error: jobTrainingError } = await supabase
        .from('job_training')
        .select('training_module_id')
        .eq('job_id', jobToDelete);
        
      if (jobTrainingError) throw jobTrainingError;
      
      // Delete the job application
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('candidate_id', user.id)
        .eq('job_id', jobToDelete);
        
      if (error) throw error;
      
      // Clear training progress for modules associated with this job
      if (jobTrainingData && jobTrainingData.length > 0) {
        const moduleIds = jobTrainingData.map(jt => jt.training_module_id);
        
        // Get videos for these modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('training_modules')
          .select('id, module')
          .in('id', moduleIds);
          
        if (modulesError) throw modulesError;
        
        if (modulesData && modulesData.length > 0) {
          // Get list of module categories
          const moduleCategories = modulesData.map(m => m.module);
          
          // Delete training progress for these modules
          if (moduleCategories.length > 0) {
            const { error: progressError } = await supabase
              .from('training_progress')
              .delete()
              .eq('user_id', user.id)
              .in('module', moduleCategories);
              
            if (progressError) throw progressError;
          }
          
          // Delete quiz results for these modules
          const { error: quizError } = await supabase
            .from('quiz_results')
            .delete()
            .eq('user_id', user.id)
            .in('module', moduleCategories);
            
          if (quizError) throw quizError;
        }
      }
      
      toast.success("Application successfully withdrawn");
      
      // Update local state
      setUserApplications(prev => {
        const updated = {...prev};
        delete updated[jobToDelete];
        return updated;
      });
      
      setJobToDelete(null);
    } catch (err: any) {
      console.error("Error deleting application:", err);
      toast.error("Failed to withdraw application: " + err.message);
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
