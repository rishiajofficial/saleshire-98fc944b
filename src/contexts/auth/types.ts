
import { Session, User } from '@supabase/supabase-js';
import { Company } from '@/services/userService';

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: any; // Profile data from the profiles table
  company: Company | null; // Company data if available
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  isCompanyAdmin: boolean; // Whether the user is an admin for their company
}
