
import { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<'profiles'>;

// Make certain properties optional to match what we receive from the database
export type Candidate = Partial<Tables<'candidates'>> & { 
  id: string;
  profile?: Pick<Profile, 'name' | 'email'> | null;
  status: string;
  current_step?: number;
  tags?: string[];
};

export type CandidateWithProfile = Candidate & {
  profile?: Pick<Profile, 'name' | 'email' | 'role'> | null;
};

export type AssessmentResult = Tables<'assessment_results'> & { 
  assessment: Pick<Tables<'assessments'>, 'title'> | null;
};

export type ManagerProfile = Pick<Profile, 'id' | 'name'>;

// Add a new type to handle candidates from job applications
export type JobApplicationCandidate = Candidate & {
  assessment_results?: any[];
};

export interface StatusHistoryEntry {
  id: string;
  application_id: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_by: string;
  updated_by_user?: {
    name: string;
  };
}

export interface CandidateTag {
  id: string;
  name: string;
  color?: string;
  description?: string;
}
