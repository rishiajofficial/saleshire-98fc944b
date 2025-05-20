
import { Region, UserRole } from './index';

// Base candidate profile definition
export interface CandidateProfile {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  location: string;
  region: Region;
  resume: string | null;
  about_me_video: string | null;
  sales_pitch_video: string | null;
  company_invite_code?: string;
  register_as_company?: string;
  company_name?: string;
  company_domain?: string;
  company_id?: string;
}

// Candidate model used in components
export interface Candidate {
  id: string;
  phone: string;
  location: string;
  region: string;
  resume: string | null;
  about_me_video: string | null;
  sales_pitch_video: string | null;
  status?: string;
  current_step?: number;
  profile?: {
    name: string;
    email: string;
  };
  assigned_manager?: string;
  company_id?: string;
}

// Candidate with full profile information
export interface CandidateWithProfile {
  id: string;
  phone: string;
  location: string;
  region: string;
  resume: string | null;
  about_me_video: string | null;
  sales_pitch_video: string | null;
  status: string;
  current_step: number;
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Assessment result definition
export interface AssessmentResult {
  id: string;
  candidate_id: string;
  assessment_id: string;
  score: number;
  completed_at: string;
  assessment?: {
    title: string;
    id: string;
  };
}

// Manager profile definition
export interface ManagerProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  regions?: string[];
}

// Job application with candidate information
export interface JobApplicationCandidate {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  job: {
    title: string;
    description: string;
    location: string;
    department: string;
    employment_type: string;
  };
  candidate: Candidate;
}
