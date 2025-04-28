
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TrainingProgressItem } from '@/types/training';

export function useCandidateTrainingProgress(candidateId?: string) {
  const [progress, setProgress] = useState<TrainingProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (candidateId) {
      fetchTrainingProgress(candidateId);
    } else {
      setLoading(false);
    }
  }, [candidateId]);

  const fetchTrainingProgress = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all training modules
      const { data: modules, error: modulesError } = await supabase
        .from('training_modules')
        .select('id, title, description')
        .order('title');

      if (modulesError) throw modulesError;

      // Fetch all module videos
      const { data: moduleVideos, error: moduleVideosError } = await supabase
        .from('module_videos')
        .select('module_id, video_id');

      if (moduleVideosError) throw moduleVideosError;

      // Fetch all module assessments
      const { data: moduleAssessments, error: moduleAssessmentsError } = await supabase
        .from('module_assessments')
        .select('module_id, assessment_id');

      if (moduleAssessmentsError) throw moduleAssessmentsError;

      // Fetch user's training progress
      const { data: videoProgress, error: videoProgressError } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId);

      if (videoProgressError) throw videoProgressError;

      // Fetch user's assessment results
      const { data: assessmentResults, error: assessmentResultsError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('candidate_id', userId);

      if (assessmentResultsError) throw assessmentResultsError;

      // Calculate progress for each module
      const progressItems: TrainingProgressItem[] = modules?.map(module => {
        // Get videos for this module
        const moduleVideoIds = moduleVideos
          .filter(mv => mv.module_id === module.id)
          .map(mv => mv.video_id);

        // Get assessments for this module
        const moduleAssessmentIds = moduleAssessments
          .filter(ma => ma.module_id === module.id)
          .map(ma => ma.assessment_id);

        // Count completed videos
        const completedVideos = videoProgress
          ?.filter(vp => moduleVideoIds.includes(vp.video_id) && vp.completed)
          .length || 0;

        // Count completed assessments with passing score
        const completedAssessments = assessmentResults
          ?.filter(ar => moduleAssessmentIds.includes(ar.assessment_id) && ar.completed && ar.score >= 70) // Assuming 70% is passing
          .length || 0;

        // Calculate overall progress
        const totalItems = moduleVideoIds.length + moduleAssessmentIds.length;
        const completedItems = completedVideos + completedAssessments;
        const progressPercentage = totalItems > 0 
          ? Math.round((completedItems / totalItems) * 100) 
          : 0;

        // Calculate time spent - default to 0 if property doesn't exist
        const timeSpent = videoProgress
          ?.filter(vp => moduleVideoIds.includes(vp.video_id))
          .reduce((total, vp) => total + ((vp as any).time_spent || 0), 0) || 0;

        // Find earliest start date from video progress
        const videoStartDates = videoProgress
          ?.filter(vp => moduleVideoIds.includes(vp.video_id))
          .map(vp => (vp as any).started_at as string | null)
          .filter(Boolean) as string[];
        
        const startedAt = videoStartDates.length > 0
          ? new Date(Math.min(...videoStartDates.map(date => new Date(date).getTime()))).toISOString()
          : null;

        // Find latest completion date if all items are completed
        const completedAt = totalItems > 0 && completedItems === totalItems
          ? new Date().toISOString() // This is a simplification
          : null;

        return {
          moduleId: module.id,
          moduleName: module.title,
          moduleDescription: module.description,
          progress: progressPercentage,
          completedVideos,
          totalVideos: moduleVideoIds.length,
          completedAssessments,
          totalAssessments: moduleAssessmentIds.length,
          startedAt,
          completedAt,
          timeSpent
        };
      }) || [];

      setProgress(progressItems);
    } catch (error: any) {
      console.error('Error fetching training progress:', error);
      setError(error.message);
      toast.error('Failed to load training progress');
    } finally {
      setLoading(false);
    }
  };

  return {
    progress,
    loading,
    error,
    refetch: candidateId ? () => fetchTrainingProgress(candidateId) : () => {}
  };
}
