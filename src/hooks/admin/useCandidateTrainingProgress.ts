
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CandidateTrainingProgress {
  candidateId: string;
  candidateName: string;
  modules: {
    moduleId: string;
    moduleName: string;
    progress: number;
    videosWatched: number;
    totalVideos: number;
    assessmentsPassed: number;
    totalAssessments: number;
    totalTimeSpent: number; // In seconds
    startedAt: string | null;
    completedAt: string | null;
  }[];
  overallProgress: number;
  startedAt: string | null;
  completedAt: string | null;
}

export function useCandidateTrainingProgress(jobId?: string) {
  const [candidateProgress, setCandidateProgress] = useState<CandidateTrainingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }

    const fetchCandidateProgress = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all candidates that have applied for this job
        const { data: applicants, error: applicantsError } = await supabase
          .from("job_applications")
          .select(`
            candidate_id,
            candidates (
              id,
              profiles (
                name,
                email
              )
            )
          `)
          .eq("job_id", jobId);

        if (applicantsError) throw applicantsError;

        if (!applicants || applicants.length === 0) {
          setCandidateProgress([]);
          setLoading(false);
          return;
        }

        // Get required training modules for this job
        const { data: jobModules, error: modulesError } = await supabase
          .from("job_modules")
          .select(`
            module_id,
            training_modules (
              id,
              name
            )
          `)
          .eq("job_id", jobId);

        if (modulesError) throw modulesError;

        // For each candidate, get their progress
        const candidateProgressData = await Promise.all(
          applicants.map(async (applicant) => {
            const candidateId = applicant.candidate_id;
            const candidateName = applicant.candidates?.profiles?.name || "Unknown";

            // Get video progress
            const { data: videoProgress, error: videoError } = await supabase
              .from("training_progress")
              .select("*")
              .eq("user_id", candidateId);

            if (videoError) throw videoError;

            // Get assessment results
            const { data: assessmentResults, error: assessmentError } = await supabase
              .from("assessment_results")
              .select("*")
              .eq("candidate_id", candidateId);

            if (assessmentError) throw assessmentError;

            // Process each required module
            const moduleProgressData = await Promise.all(
              (jobModules || []).map(async (jobModule) => {
                const moduleId = jobModule.module_id;
                const moduleName = jobModule.training_modules?.name || "Unknown Module";

                // Get videos for this module
                const { data: moduleVideos, error: moduleVideosError } = await supabase
                  .from("module_videos")
                  .select(`
                    video_id,
                    videos (id)
                  `)
                  .eq("module_id", moduleId);

                if (moduleVideosError) throw moduleVideosError;

                // Get assessments for this module
                const { data: moduleAssessments, error: moduleAssessmentsError } = await supabase
                  .from("module_assessments")
                  .select(`
                    assessment_id,
                    assessments (id)
                  `)
                  .eq("module_id", moduleId);

                if (moduleAssessmentsError) throw moduleAssessmentsError;

                // Calculate videos watched
                const totalVideos = (moduleVideos || []).length;
                const videoIds = (moduleVideos || []).map(mv => mv.video_id);
                const watchedVideos = videoIds.filter(videoId => 
                  (videoProgress || []).some(vp => vp.video_id === videoId && vp.completed)
                ).length;

                // Calculate assessments passed
                const totalAssessments = (moduleAssessments || []).length;
                const assessmentIds = (moduleAssessments || []).map(ma => ma.assessment_id);
                const passedAssessments = assessmentIds.filter(assessmentId =>
                  (assessmentResults || []).some(ar => ar.assessment_id === assessmentId && ar.completed && ar.score >= 70)
                ).length;

                // Calculate progress percentage
                const totalItems = totalVideos + totalAssessments;
                const completedItems = watchedVideos + passedAssessments;
                const progress = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;

                // Calculate time spent
                const timeSpentOnVideos = (videoProgress || [])
                  .filter(vp => videoIds.includes(vp.video_id))
                  .reduce((total, vp) => total + (vp.time_spent || 0), 0);

                const timeSpentOnAssessments = (assessmentResults || [])
                  .filter(ar => assessmentIds.includes(ar.assessment_id))
                  .reduce((total, ar) => {
                    if (ar.started_at && ar.completed_at) {
                      const start = new Date(ar.started_at);
                      const end = new Date(ar.completed_at);
                      return total + (end.getTime() - start.getTime()) / 1000; // convert to seconds
                    }
                    return total;
                  }, 0);

                const totalTimeSpent = timeSpentOnVideos + timeSpentOnAssessments;

                // Find earliest start and latest completion
                const videoStarts = (videoProgress || [])
                  .filter(vp => videoIds.includes(vp.video_id) && vp.started_at)
                  .map(vp => new Date(vp.started_at!).getTime());

                const assessmentStarts = (assessmentResults || [])
                  .filter(ar => assessmentIds.includes(ar.assessment_id) && ar.started_at)
                  .map(ar => new Date(ar.started_at!).getTime());

                const allStarts = [...videoStarts, ...assessmentStarts];
                const startedAt = allStarts.length > 0 ? new Date(Math.min(...allStarts)).toISOString() : null;

                const videoCompletions = (videoProgress || [])
                  .filter(vp => videoIds.includes(vp.video_id) && vp.completed_at)
                  .map(vp => new Date(vp.completed_at!).getTime());

                const assessmentCompletions = (assessmentResults || [])
                  .filter(ar => assessmentIds.includes(ar.assessment_id) && ar.completed_at)
                  .map(ar => new Date(ar.completed_at!).getTime());

                const allCompletions = [...videoCompletions, ...assessmentCompletions];
                const completedAt = progress === 100 && allCompletions.length > 0 
                  ? new Date(Math.max(...allCompletions)).toISOString()
                  : null;

                return {
                  moduleId,
                  moduleName,
                  progress,
                  videosWatched: watchedVideos,
                  totalVideos,
                  assessmentsPassed: passedAssessments,
                  totalAssessments,
                  totalTimeSpent,
                  startedAt,
                  completedAt
                };
              })
            );

            // Calculate overall progress
            const overallProgress = moduleProgressData.length > 0
              ? Math.round(moduleProgressData.reduce((sum, module) => sum + module.progress, 0) / moduleProgressData.length)
              : 0;

            // Find overall start and completion dates
            const moduleStarts = moduleProgressData
              .filter(module => module.startedAt)
              .map(module => new Date(module.startedAt!).getTime());

            const overallStartedAt = moduleStarts.length > 0
              ? new Date(Math.min(...moduleStarts)).toISOString()
              : null;

            const isFullyCompleted = moduleProgressData.every(module => module.progress === 100);
            const moduleCompletions = moduleProgressData
              .filter(module => module.completedAt)
              .map(module => new Date(module.completedAt!).getTime());

            const overallCompletedAt = isFullyCompleted && moduleCompletions.length === moduleProgressData.length && moduleCompletions.length > 0
              ? new Date(Math.max(...moduleCompletions)).toISOString()
              : null;

            return {
              candidateId,
              candidateName,
              modules: moduleProgressData,
              overallProgress,
              startedAt: overallStartedAt,
              completedAt: overallCompletedAt
            };
          })
        );

        setCandidateProgress(candidateProgressData);
      } catch (error: any) {
        console.error("Error fetching candidate training progress:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateProgress();
  }, [jobId]);

  return {
    candidateProgress,
    loading,
    error
  };
}
