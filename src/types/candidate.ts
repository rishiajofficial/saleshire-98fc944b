
// Add or update the file to include the extended user data properties
import { Region, UserRole } from './index';

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
