
import { Session, User } from '@supabase/supabase-js';

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

export interface CompanyProfile {
  id: string;
  name: string;
  domain: string | null;
  logo: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id: string | null;
  company?: CompanyProfile;
  isCompanyAdmin?: boolean;
}
