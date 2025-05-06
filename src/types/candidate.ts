
import { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<'profiles'>;

// Make certain properties optional to match what we receive from the database
export type Candidate = Partial<Tables<'candidates'>> & { 
  id: string;
  profile?: Pick<Profile, 'name' | 'email'> | null;
  status: string;
  current_step?: number;
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
