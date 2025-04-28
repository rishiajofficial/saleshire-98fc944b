
interface TrainingModuleProgress {
  moduleId: string;
  videoProgress: Record<string, boolean>;
  assessmentScores: Record<string, number>;
  completedAssessments: string[];
  completed: boolean;
}

export interface VideoProgressData {
  user_id: string;
  video_id: string;
  completed: boolean;
  module: string;
  completed_at?: string;
}

export interface AssessmentProgressData {
  user_id: string;
  module: string;
  score: number;
  passed: boolean;
  total_questions: number;
  answers?: Record<string, any> | null;
  completed_at?: string;
  created_at?: string;
  id?: string;
}

export type { TrainingModuleProgress };
