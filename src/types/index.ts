
export type UserRole = 'candidate' | 'manager' | 'admin';
export type Region = 'north' | 'south' | 'east' | 'west' | 'central';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface Candidate extends User {
  phone: string;
  location: string;
  region: Region;
  status: 'applied' | 'screening' | 'training' | 'sales_task' | 'interview' | 'hired' | 'rejected';
  resume?: string;
  aboutMeVideo?: string;
  salesPitchVideo?: string;
  currentStep: 1 | 2 | 3 | 4;
  assignedManager?: string;
}

export interface Manager extends User {
  candidates: string[];
  regions: Region[];
}

export interface Admin extends User {}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  difficulty?: 'Basic' | 'Intermediate' | 'Advanced';
  timeLimit?: number; // Time limit per question in seconds
  randomizeQuestions?: boolean;
  preventBacktracking?: boolean;
  sections?: AssessmentSection[];
}

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  section?: string;
  timeLimit?: number; // Override assessment time limit for specific question
}

export interface AssessmentResult {
  id: string;
  candidateId: string;
  assessmentId: string;
  score: number;
  answers: Record<string, string>;
  answerTimings: Record<string, number>; // Time taken for each question
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  feedback?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  quiz?: Assessment;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  module: 'product' | 'sales' | 'relationship';
}

export interface SalesTask {
  id: string;
  candidateId: string;
  shops: Shop[];
  pitchRecording?: string;
  feedback?: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Shop {
  name: string;
  address: string;
  contact?: string;
  converted: boolean;
}

export interface Interview {
  id: string;
  candidateId: string;
  managerId: string;
  scheduledAt: Date;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  decision?: 'hired' | 'rejected';
  feedback?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: string;
  module: 'product' | 'sales' | 'relationship';
  createdAt: Date;
  createdBy: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  module: 'product' | 'sales' | 'relationship';
  questionCount: number;
  passingScore: number;
  questions: Question[];
  createdAt: Date;
  createdBy: string;
  timeLimit?: number; // Time limit per question in seconds
  randomizeQuestions?: boolean;
}
