
import { Database } from "@/integrations/supabase/types";

export type CandidateWithProfile = Database['public']['Tables']['candidates']['Row'] & {
  profile?: {
    name: string;
    email: string;
    role: string;
  }
};
