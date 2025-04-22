
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

      if (error) throw error;
      return data as Job[];
    }
  });

  const createJob = useMutation({
    mutationFn: async (newJob: { 
      title: string;
      description: string;
      selectedAssessment?: string;
      selectedTrainingModule?: string;
    }) => {
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          title: newJob.title,
          description: newJob.description,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          status: 'active'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      if (newJob.selectedAssessment) {
        const { error: assessmentError } = await supabase
          .from('job_assessments')
          .insert({
            job_id: jobData.id,
            assessment_id: newJob.selectedAssessment
          });
        if (assessmentError) throw assessmentError;
      }

      if (newJob.selectedTrainingModule) {
        const { error: trainingError } = await supabase
          .from('job_training')
          .insert({
            job_id: jobData.id,
            training_module_id: newJob.selectedTrainingModule
          });
        if (trainingError) throw trainingError;
      }

      return jobData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
    },
    onError: (error) => {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    }
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  });

  return {
    jobs,
    isLoading,
    createJob,
    deleteJob
  };
}
