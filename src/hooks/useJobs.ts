
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { toast } from "sonner";

export function useJobs() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          job_modules (
            module_id,
            training_modules (
              id,
              name,
              description,
              status
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const createJob = useMutation({
    mutationFn: async (newJob: any) => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!userData.user) {
          throw new Error('User not authenticated');
        }
        
        const userId = userData.user.id;
        
        // Create job
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .insert({
            title: newJob.title,
            description: newJob.description,
            department: newJob.department,
            location: newJob.location,
            employment_type: newJob.employment_type,
            salary_range: newJob.salary_range,
            created_by: userId,
            status: 'active'
          })
          .select()
          .single();

        if (jobError) throw jobError;

        // Add training modules
        if (newJob.selectedModules && newJob.selectedModules.length > 0) {
          const moduleInserts = newJob.selectedModules.map((moduleId: string) => ({
            job_id: jobData.id,
            module_id: moduleId
          }));

          const { error: modulesError } = await supabase
            .from('job_modules')
            .insert(moduleInserts);

          if (modulesError) throw modulesError;
        }

        // Handle assessment association if selected
        if (newJob.selectedAssessment && newJob.selectedAssessment !== "none") {
          const { error: assessmentError } = await supabase
            .from('job_assessments')
            .insert({
              job_id: jobData.id,
              assessment_id: newJob.selectedAssessment
            });
          
          if (assessmentError) throw assessmentError;
        }

        return jobData;
      } catch (error: any) {
        console.error("Job creation error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
    },
    onError: (error: any) => {
      console.error('Error creating job:', error);
      toast.error(`Failed to create job: ${error.message || 'Unknown error'}`);
    }
  });

  const updateJob = useMutation({
    mutationFn: async (updateJobData: any) => {
      try {
        const { id, selectedAssessment, selectedModules, ...jobFields } = updateJobData;
        
        // 1. Update job basic fields
        const { error: jobUpdateError } = await supabase
          .from('jobs')
          .update(jobFields)
          .eq('id', id);

        if (jobUpdateError) throw jobUpdateError;

        // 2. Update training modules
        if (selectedModules) {
          // First delete existing module associations
          const { error: deleteModulesError } = await supabase
            .from('job_modules')
            .delete()
            .eq('job_id', id);
            
          if (deleteModulesError) throw deleteModulesError;
          
          // Then insert new modules if any are selected
          if (selectedModules.length > 0) {
            const moduleInserts = selectedModules.map((moduleId: string) => ({
              job_id: id,
              module_id: moduleId
            }));

            const { error: modulesError } = await supabase
              .from('job_modules')
              .insert(moduleInserts);
            
            if (modulesError) throw modulesError;
          }
        }
        
        // 3. Handle assessment association
        if (selectedAssessment !== undefined) {
          const { error: deleteAssessmentError } = await supabase
            .from('job_assessments')
            .delete()
            .eq('job_id', id);
            
          if (deleteAssessmentError) throw deleteAssessmentError;
          
          if (selectedAssessment !== "none" && selectedAssessment !== null) {
            const { error: assessmentError } = await supabase
              .from('job_assessments')
              .insert({
                job_id: id,
                assessment_id: selectedAssessment
              });
            
            if (assessmentError) throw assessmentError;
          }
        }
        
        return { id, ...jobFields };
      } catch (error: any) {
        console.error("Job update error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating job:', error);
      toast.error(`Failed to update job: ${error.message || 'Unknown error'}`);
    }
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      // Delete job modules
      const { error: moduleError } = await supabase
        .from('job_modules')
        .delete()
        .eq('job_id', jobId);
      
      if (moduleError) throw moduleError;
      
      // Delete job assessments
      const { error: assessmentError } = await supabase
        .from('job_assessments')
        .delete()
        .eq('job_id', jobId);
      
      if (assessmentError) throw assessmentError;

      // Delete job applications
      const { error } = await supabase.rpc('delete_job_applications', { job_id: jobId });
      if (error) throw error;

      // Delete the job
      const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (deleteError) throw deleteError;
      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job and related applications deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting job:', error);
      toast.error(`Failed to delete job: ${error.message}`);
    }
  });

  return {
    jobs,
    isLoading,
    createJob,
    updateJob,
    deleteJob,
    refetch
  };
}
