
import { supabase } from '@/integrations/supabase/client';

class UserServiceClass {
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }
  
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
  
  // Use a non-recursive approach for fetching company data
  async getUserCompany(userId: string) {
    // First get the company_id from the user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single();
    
    if (profileError) throw profileError;
    if (!profile?.company_id) return null;
    
    // Then fetch the company based on that ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', profile.company_id)
      .single();
    
    if (companyError) throw companyError;
    return company;
  }
  
  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    return data;
  }
}

export const userService = new UserServiceClass();
