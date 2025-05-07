import { useState, useEffect } from 'react';
import { useTrainingProgress } from '@/hooks/training/useTrainingProgress';
import { TrainingModuleProgress } from '@/types/training';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useTrainingModulesList = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<TrainingModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    videoProgress, 
    assessmentScores, 
    completedAssessments,
    calculateModuleProgress 
  } = useTrainingProgress(user?.id);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        
        // Get candidate's job application first
        const { data: jobApplicationData, error: jobAppError } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('candidate_id', user?.id);
          
        if (jobAppError) throw jobAppError;
        
        if (!jobApplicationData || jobApplicationData.length === 0) {
          setModules([]);
          return;
        }

        // Extract job IDs from all applications
        const jobIds = jobApplicationData.map(app => app.job_id);

        // Get the job's training modules for all jobs the candidate has applied to
        const { data: jobTrainingData, error: jobTrainingError } = await supabase
          .from('job_training')
          .select('training_module_id')
          .in('job_id', jobIds);
          
        if (jobTrainingError) throw jobTrainingError;

        // Extract module IDs
        const moduleIds = jobTrainingData?.map(jt => jt.training_module_id) || [];
        
        if (moduleIds.length === 0) {
          setModules([]);
          setLoading(false);
          return;
        }
        
        // Fetch training modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('training_modules')
          .select('*')
          .in('id', moduleIds)
          .eq('archived', false)
          .order('title', { ascending: true });
          
        if (modulesError) throw modulesError;
        
        // Fetch videos for the modules
        const { data: videosData, error: videosError } = await supabase
          .from('videos')
          .select('*')
          .eq('archived', false);
          
        if (videosError) throw videosError;
        
        // Process the modules
        const processedModules: TrainingModuleProgress[] = [];
        let prevComplete = true; // First module is always unlocked
        
        for (const module of (modulesData || [])) {
          // Get videos for this module
          const moduleVideos = videosData?.filter(
            video => video.module === module.module
          ) || [];
          
          // Calculate completion stats
          const totalVideos = moduleVideos.length;
          const watchedVideos = moduleVideos.filter(
            video => videoProgress[video.id]
          ).length;
          
          // Check if quiz completed
          const quizIds = module.quiz_id ? [module.quiz_id] : [];
          const quizCompleted = module.quiz_id ? 
            completedAssessments.includes(module.quiz_id) : true;
          
          // Calculate progress
          const progress = calculateModuleProgress(moduleVideos, quizIds);
          const isComplete = progress === 100;
          
          // Determine lock status based on previous module completion
          const locked = !prevComplete;
          let status: 'active' | 'inactive' | 'locked' | 'completed' | 'in_progress' = 'inactive';
          
          if (locked) {
            status = 'locked';
          } else if (isComplete) {
            status = 'completed';
          } else if (watchedVideos > 0 || quizCompleted) {
            status = 'in_progress';
          } else {
            status = 'active';
          }
          
          // Update lock status for next module
          prevComplete = prevComplete && isComplete;
          
          processedModules.push({
            id: module.id,
            title: module.title,
            description: module.description,
            module: module.module,
            videos: moduleVideos,
            quizIds: quizIds,
            totalVideos,
            watchedVideos,
            quizCompleted,
            progress,
            status,
            locked
          });
        }
        
        setModules(processedModules);
      } catch (err: any) {
        console.error('Error fetching training modules:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [videoProgress, completedAssessments, calculateModuleProgress, user?.id]);

  return { modules, loading, error };
};
