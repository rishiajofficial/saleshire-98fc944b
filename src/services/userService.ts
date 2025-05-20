
import { supabase } from '@/integrations/supabase/client';
import { type Database } from '@/integrations/supabase/types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];

export type ProfileWithCompany = Profile & {
  company?: Company | null;
};

export type UserRole = 'admin' | 'candidate' | 'manager' | 'hr' | 'director';

interface GetUserProfilesOptions {
  ids?: string[];
  role?: UserRole;
  companyId?: string;
}

export const getUserProfiles = async (options: GetUserProfilesOptions = {}) => {
  try {
    let query = supabase
      .from('profiles')
      .select('*');
    
    if (options.ids && options.ids.length > 0) {
      query = query.in('id', options.ids);
    }
    
    if (options.role) {
      query = query.eq('role', options.role);
    }
    
    if (options.companyId) {
      query = query.eq('company_id', options.companyId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching user profiles:', error);
      throw error;
    }
    
    return data as Profile[];
  } catch (error) {
    console.error('Error in getUserProfiles:', error);
    throw error;
  }
};

export const getUserWithCompany = async (userId: string) => {
  try {
    // First get the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, company:companies(*)')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user with company:', profileError);
      throw profileError;
    }
    
    // Extract the user and company from the response
    const { company, ...userProfile } = profile;
    
    // Return as a ProfileWithCompany object
    return {
      ...userProfile,
      company
    } as ProfileWithCompany;
  } catch (error) {
    console.error('Error in getUserWithCompany:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<Profile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUserRole = async (userId: string): Promise<UserRole | null> => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_role', { user_id: userId });
    
    if (error) {
      console.error('Error getting user role:', error);
      throw error;
    }
    
    return data as UserRole;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
};

export const createCompany = async (companyData: { name: string; domain?: string; logo?: string }) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert(companyData)
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating company:', error);
    throw error;
  }
};

export const updateCompany = async (companyId: string, companyData: Partial<Company>) => {
  try {
    const { error } = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', companyId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
};

export const assignUserToCompany = async (userId: string, companyId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ company_id: companyId })
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error assigning user to company:', error);
    throw error;
  }
};

export const removeUserFromCompany = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ company_id: null })
      .eq('id', userId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing user from company:', error);
    throw error;
  }
};

export const makeUserCompanyAdmin = async (userId: string, companyId: string) => {
  try {
    const { error } = await supabase
      .from('company_admins')
      .insert({ user_id: userId, company_id: companyId });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error making user company admin:', error);
    throw error;
  }
};

export const removeUserAsCompanyAdmin = async (userId: string, companyId: string) => {
  try {
    const { error } = await supabase
      .from('company_admins')
      .delete()
      .match({ user_id: userId, company_id: companyId });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing user as company admin:', error);
    throw error;
  }
};

export const getCompanyUsers = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('company_id', companyId);
    
    if (error) throw error;
    
    return data as Profile[];
  } catch (error) {
    console.error('Error getting company users:', error);
    throw error;
  }
};

export const isUserCompanyAdmin = async (userId: string, companyId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('is_company_admin', { 
        user_uuid: userId, 
        company_uuid: companyId 
      });
    
    if (error) throw error;
    
    return data as boolean;
  } catch (error) {
    console.error('Error checking if user is company admin:', error);
    return false;
  }
};

export const getUserCompany = async () => {
  try {
    const { data, error } = await supabase.rpc('get_user_company');
    
    if (error) throw error;
    
    return data as string;
  } catch (error) {
    console.error('Error getting user company:', error);
    return null;
  }
};
