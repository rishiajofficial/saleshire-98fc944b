
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { toast } from "sonner";

export function useJobs() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }
      return data as Job[];
    }
  });

  const createJob = useMutation({
    mutationFn: async (newJob: any) => {
      try {
        console.log("Creating job with data:", newJob);
        
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (!userData.user) {
          throw new Error('User not authenticated');
        }
        
        const userId = userData.user.id;
        
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

        if (jobError) {
          console.error("Error creating job:", jobError);
          throw jobError;
        }

        // Handle assessment association if selected
        if (newJob.selectedAssessment && newJob.selectedAssessment !== "none") {
          const { error: assessmentError } = await supabase
            .from('job_assessments')
            .insert({
              job_id: jobData.id,
              assessment_id: newJob.selectedAssessment
            });
          
          if (assessmentError) {
            console.error("Error associating assessment:", assessmentError);
            throw assessmentError;
          }
        }

        // Handle training module association if selected
        if (newJob.selectedTrainingModule && newJob.selectedTrainingModule !== "none") {
          const { error: trainingError } = await supabase
            .from('job_training')
            .insert({
              job_id: jobData.id,
              training_module_id: newJob.selectedTrainingModule
            });
          
          if (trainingError) {
            console.error("Error associating training module:", trainingError);
            throw trainingError;
          }
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
        const { id, selectedAssessment, selectedTrainingModule, ...jobFields } = updateJobData;
        
        // 1. Update job basic fields
        const { error: jobUpdateError } = await supabase
          .from('jobs')
          .update(jobFields)
          .eq('id', id);

        if (jobUpdateError) throw jobUpdateError;
        
        // 2. Handle assessment association
        if (selectedAssessment) {
          // First delete existing assessment associations
          const { error: deleteAssessmentError } = await supabase
            .from('job_assessments')
            .delete()
            .eq('job_id', id);
            
          if (deleteAssessmentError) throw deleteAssessmentError;
          
          // Then insert new assessment if not "none"
          if (selectedAssessment !== "none") {
            const { error: assessmentError } = await supabase
              .from('job_assessments')
              .insert({
                job_id: id,
                assessment_id: selectedAssessment
              });
            
            if (assessmentError) throw assessmentError;
          }
        }
        
        // 3. Handle training module association
        if (selectedTrainingModule) {
          // First delete existing training module associations
          const { error: deleteTrainingError } = await supabase
            .from('job_training')
            .delete()
            .eq('job_id', id);
            
          if (deleteTrainingError) throw deleteTrainingError;
          
          // Then insert new training module if not "none"
          if (selectedTrainingModule !== "none") {
            const { error: trainingError } = await supabase
              .from('job_training')
              .insert({
                job_id: id,
                training_module_id: selectedTrainingModule
              });
            
            if (trainingError) throw trainingError;
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
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      return jobId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting job:', error);
      toast.error(`Failed to delete job: ${error.message || 'Unknown error'}`);
    }
  });

  return {
    jobs,
    isLoading,
    createJob,
    updateJob,
    deleteJob
  };
}
