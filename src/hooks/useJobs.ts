
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Job } from "@/types/job";
import { toast } from "sonner";

export function useJobs() {
  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      console.log("Fetching jobs with categories...");
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          job_categories (
            category_id,
            module_categories (
              id,
              name,
              description,
              quiz_ids
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching jobs:", error);
        throw error;
      }

      console.log("Fetched jobs data:", data);
      return data as Job[];
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

        // Add training categories
        if (newJob.categories && newJob.categories.length > 0) {
          const categoryInserts = newJob.categories.map((categoryId: string) => ({
            job_id: jobData.id,
            category_id: categoryId
          }));

          const { error: categoriesError } = await supabase
            .from('job_categories')
            .insert(categoryInserts);

          if (categoriesError) throw categoriesError;
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
        const { id, selectedAssessment, categories, ...jobFields } = updateJobData;
        
        // 1. Update job basic fields
        const { error: jobUpdateError } = await supabase
          .from('jobs')
          .update(jobFields)
          .eq('id', id);

        if (jobUpdateError) throw jobUpdateError;

        // 2. Update training categories
        if (categories) {
          // First delete existing category associations
          const { error: deleteCategoriesError } = await supabase
            .from('job_categories')
            .delete()
            .eq('job_id', id);
            
          if (deleteCategoriesError) throw deleteCategoriesError;
          
          // Then insert new categories if any are selected
          if (categories.length > 0) {
            const categoryInserts = categories.map((categoryId: string) => ({
              job_id: id,
              category_id: categoryId
            }));

            const { error: categoriesError } = await supabase
              .from('job_categories')
              .insert(categoryInserts);
            
            if (categoriesError) throw categoriesError;
          }
        }
        
        // 3. Handle assessment association
        if (selectedAssessment) {
          const { error: deleteAssessmentError } = await supabase
            .from('job_assessments')
            .delete()
            .eq('job_id', id);
            
          if (deleteAssessmentError) throw deleteAssessmentError;
          
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
