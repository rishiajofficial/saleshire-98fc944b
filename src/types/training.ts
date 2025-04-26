
export interface TrainingModule {
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

export interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  duration: string | null;
  module: string;
}
