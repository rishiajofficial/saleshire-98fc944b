
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Video, Assessment, TrainingProgress } from "@/types/training";

export interface TrainingModuleProgress {
  id: string;
  title: string;
  description: string | null;
  status: 'completed' | 'in_progress' | 'locked';
  progress: number;
  videos: Video[];
  assessments: Assessment[];
  watchedVideos: number;
  totalVideos: number;
  passedAssessments: number;
  totalAssessments: number;
  completed: boolean;
}

export function useTrainingProgress(userId?: string) {
  const [videoProgress, setVideoProgress] = useState<Record<string, boolean>>({});
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});
  const [completedAssessments, setCompletedAssessments] = useState<string[]>([]);
  const [trainingModules, setTrainingModules] = useState<TrainingModuleProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all progress data when userId changes
  const fetchProgressData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get video progress data
      const { data: videoProgressData, error: videoError } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('completed', true);

      if (videoError) throw videoError;

      // Build video progress lookup
      const videoProgressLookup: Record<string, boolean> = {};
      videoProgressData?.forEach(item => {
        videoProgressLookup[item.video_id] = true;
      });
      setVideoProgress(videoProgressLookup);
      
      // Get assessment scores and completion status
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('candidate_id', userId)
        .eq('completed', true);

      if (assessmentError) throw assessmentError;

      // Build assessment scores lookup
      const scoresLookup: Record<string, number> = {};
      const completedAssessmentsIds: string[] = [];
      
      assessmentData?.forEach(item => {
        scoresLookup[item.assessment_id] = item.score;
        if (item.score >= 70) { // Assuming passing is 70%
          completedAssessmentsIds.push(item.assessment_id);
        }
      });
      
      setAssessmentScores(scoresLookup);
      setCompletedAssessments(completedAssessmentsIds);
      
      // Fetch all training modules
      await fetchTrainingModules();
      
    } catch (error: any) {
      console.error('Error fetching training progress:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  const fetchTrainingModules = async () => {
    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('training_modules')
        .select(`
          id, 
          name,
          description,
          status,
          thumbnail
        `)
        .eq('status', 'active');
      
      if (modulesError) throw modulesError;
      
      // For each module, fetch videos and assessments
      const modulesWithContent = await Promise.all(
        (modulesData || []).map(async module => {
          // Get videos for this module
          const { data: moduleVideos, error: videosError } = await supabase
            .from('module_videos')
            .select(`
              video_id,
              order,
              videos (*)
            `)
            .eq('module_id', module.id)
            .order('order');
          
          if (videosError) throw videosError;
          
          // Get assessments for this module
          const { data: moduleAssessments, error: assessmentsError } = await supabase
            .from('module_assessments')
            .select(`
              assessment_id,
              order,
              assessments (*)
            `)
            .eq('module_id', module.id)
            .order('order');
          
          if (assessmentsError) throw assessmentsError;
          
          // Extract videos and assessments from nested response
          const videos = moduleVideos?.map(mv => mv.videos) || [];
          const assessments = moduleAssessments?.map(ma => ma.assessments) || [];
          
          // Calculate progress
          const watchedVideos = videos.filter(v => v && videoProgress[v.id]).length;
          const passedAssessments = assessments.filter(a => a && completedAssessments.includes(a.id)).length;
          
          const totalVideos = videos.length;
          const totalAssessments = assessments.length;
          const totalItems = totalVideos + totalAssessments;
          const completedItems = watchedVideos + passedAssessments;
          
          const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
          const completed = progress === 100;
          
          // Determine module status
          let status: 'completed' | 'in_progress' | 'locked' = 'locked';
          if (completed) {
            status = 'completed';
          } else if (watchedVideos > 0 || passedAssessments > 0) {
            status = 'in_progress';
          }
          
          return {
            id: module.id,
            title: module.name,
            description: module.description,
            status,
            progress,
            videos,
            assessments,
            watchedVideos,
            totalVideos,
            passedAssessments,
            totalAssessments,
            completed
          };
        })
      );
      
      setTrainingModules(modulesWithContent);
      
    } catch (error: any) {
      console.error('Error fetching training modules:', error);
      setError(error.message);
    }
  };
  
  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);
  
  return {
    trainingModules,
    videoProgress,
    assessmentScores,
    completedAssessments,
    isLoading,
    error,
    refetch: fetchProgressData
  };
}
