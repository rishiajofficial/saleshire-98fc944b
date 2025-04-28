export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  tags: string[] | null;
  status: 'active' | 'inactive' | 'completed' | 'in_progress' | 'locked';
  thumbnail: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  module?: string;
  content?: string | null;
  video_url?: string | null;
  quiz_id?: string | null;
  // Additional fields used in the UI
  progress?: number;
  locked?: boolean;
  videos?: Video[];
  quizIds?: string[] | null;
  totalVideos?: number;
  watchedVideos?: number;
  quizCompleted?: boolean;
  is_quiz?: boolean;
}

export interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  duration: string | null;
  thumbnail?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  created_at?: string;
  updated_at?: string;
  created_by: string;
  module: string;
  upload_status?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string | null;
  timeLimit?: number | null;
  time_limit?: number | null;
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
  order_number?: number;
  created_at?: string;
}

export interface ModuleAssessment {
  id: string;
  module_id: string;
  assessment_id: string;
  order_number?: number;
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

export interface TrainingProgressItem {
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

export interface TrainingProgressRecord {
  id: string;
  user_id: string;
  video_id: string;
  module: string;
  completed: boolean;
  completed_at?: string | null;
  started_at?: string | null;
  time_spent?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface AssessmentScoreRecord {
  id?: string;
  user_id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  completed_at?: string | null;
  created_at?: string;
}

export interface TrainingModuleProgress {
  id: string;
  title: string;
  description: string | null;
  module: string;
  progress: number;
  status: 'completed' | 'in_progress' | 'locked';
  locked: boolean;
  videos: Video[];
  quizIds: string[] | null;
  totalVideos: number;
  watchedVideos: number;
  quizCompleted: boolean;
}

export interface UserVideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  completed: boolean;
  completed_at?: string | null;
  watched_seconds?: number;
}

export interface UserAssessmentScore {
  id: string;
  user_id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  completed_at?: string | null;
}
