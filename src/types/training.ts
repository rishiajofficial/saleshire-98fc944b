
export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  thumbnail?: string | null;
  tags?: string[] | null;
  status: 'active' | 'inactive';
  videos: Video[];
  assessments: Assessment[];
  videoOrder?: string[] | null; // Array of video IDs in specified order
  assessmentOrder?: string[] | null; // Array of assessment IDs in specified order
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
