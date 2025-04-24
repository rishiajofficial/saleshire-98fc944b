
import { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<'profiles'>;
export type Candidate = Tables<'candidates'> & { 
  profile: Pick<Profile, 'name' | 'email'> | null 
};
export type CandidateWithProfile = Candidate & {
  profile: Pick<Profile, 'name' | 'email' | 'role'> | null 
};
export type AssessmentResult = Tables<'assessment_results'> & { 
  assessment: Pick<Tables<'assessments'>, 'title'> | null 
};
export type ManagerProfile = Pick<Profile, 'id' | 'name'>;
