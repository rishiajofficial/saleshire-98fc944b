
export interface TrainingModule {
  id: string;
  title: string;
  name: string;
  description: string | null;
  tags: string[] | null;
  status: 'active' | 'inactive';
  thumbnail: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  duration: string | null;
  thumbnail?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  module: string;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string | null;
  timeLimit?: number | null;
  passingScore?: number;
  randomizeQuestions?: boolean;
  questions?: AssessmentQuestion[];
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  difficulty?: string | null;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer?: string | number;
  score?: number;
}

export interface TrainingProgress {
  userId: string;
  moduleId: string;
  completedVideos: string[]; // Array of video IDs
  completedAssessments: string[]; // Array of assessment IDs
  assessmentScores: Record<string, number>; // Assessment ID -> score
  completed: boolean;
  passed: boolean;
  startedAt?: string;
  completedAt?: string;
  timeSpent?: number; // Time in seconds
}

export interface ModuleVideo {
  id: string;
  module_id: string;
  video_id: string;
  order: number;
  created_at?: string;
}

export interface ModuleAssessment {
  id: string;
  module_id: string;
  assessment_id: string;
  order: number;
  created_at?: string;
}

export interface JobModule {
  id: string;
  job_id: string;
  module_id: string;
  created_at?: string;
}

export interface ModuleVideoRelation {
  moduleId: string;
  videoId: string;
  order: number;
}

export interface ModuleAssessmentRelation {
  moduleId: string;
  assessmentId: string;
  order: number;
}
