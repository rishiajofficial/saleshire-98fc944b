
// Add this file if it doesn't exist or update it if it exists
export interface Video {
  id: string;
  title: string;
  url: string;
  duration: string;
  description?: string;
  module: string;
  thumbnail?: string;
  archived?: boolean;
  created_at?: string;
  created_by?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string | null;
  module: string;
  created_at?: string;
  created_by?: string;
  content?: string;
  tags?: string[] | null;
  status?: 'active' | 'inactive';
  thumbnail?: string | null;
  archived?: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  topic?: string;
  time_limit?: number;
  created_at?: string;
  created_by?: string;
  archived?: boolean;
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

export interface TrainingModuleProgress {
  id: string;
  title: string;
  description?: string;
  module: string;
  progress: number;
  status: 'active' | 'inactive' | 'locked';
  locked: boolean;
  videos: Video[];
  quizIds: string[] | null;
  totalVideos: number;
  watchedVideos: number;
  quizCompleted: boolean;
}
