
export type UserRole = 'candidate' | 'manager' | 'admin';

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
  status: 'applied' | 'screening' | 'training' | 'sales_task' | 'interview' | 'hired' | 'rejected';
  resume?: string;
  aboutMeVideo?: string;
  salesPitchVideo?: string;
  currentStep: 1 | 2 | 3 | 4;
  assignedManager?: string;
}

export interface Manager extends User {
  candidates: string[];
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
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
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
