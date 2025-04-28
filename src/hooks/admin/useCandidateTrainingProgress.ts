import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingProgressItem {
  moduleId: string;
  moduleName: string;
  moduleDescription: string | null;
  progress: number;
  completedVideos: number;
  totalVideos: number;
  completedAssessments: number;
  totalAssessments: number;
  startedAt: string | null;
  completedAt: string | null;
  timeSpent: number;
}

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

      // Fetch user's video progress
      const { data: videoProgress, error: videoProgressError } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', userId);

      if (videoProgressError) throw videoProgressError;

      // Fetch user's assessment progress
      const { data: assessmentProgress, error: assessmentProgressError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('user_id', userId);

      if (assessmentProgressError) throw assessmentProgressError;

      // Calculate progress for each module
      const progressItems: TrainingProgressItem[] = modules.map(module => {
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
          .filter(vp => moduleVideoIds.includes(vp.video_id) && vp.completed)
          .length;

        // Count completed assessments
        const completedAssessments = assessmentProgress
          .filter(ap => moduleAssessmentIds.includes(ap.assessment_id) && ap.passed)
          .length;

        // Calculate overall progress
        const totalItems = moduleVideoIds.length + moduleAssessmentIds.length;
        const completedItems = completedVideos + completedAssessments;
        const progressPercentage = totalItems > 0 
          ? Math.round((completedItems / totalItems) * 100) 
          : 0;

        // Calculate time spent
        const timeSpent = videoProgress
          .filter(vp => moduleVideoIds.includes(vp.video_id))
          .reduce((total, vp) => total + (vp.time_spent || 0), 0);

        // Find earliest started_at
        const startedVideos = videoProgress
          .filter(vp => moduleVideoIds.includes(vp.video_id) && vp.started_at);
        
        const startedAt = startedVideos.length > 0
          ? startedVideos.reduce((earliest, vp) => {
              const vpDate = vp.started_at ? new Date(vp.started_at) : null;
              return vpDate && (!earliest || vpDate < earliest) ? vpDate : earliest;
            }, null as Date | null)?.toISOString()
          : null;

        // Find latest completed_at if all items are completed
        const completedAt = totalItems > 0 && completedItems === totalItems
          ? new Date().toISOString() // This is a simplification; ideally would use actual completion timestamps
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
      });

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
