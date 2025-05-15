
import { supabase } from '@/integrations/supabase/client';

export const parseProfile = (profile: any) => {
  if (!profile) return null;

  // Create a company object if companies data is present
  const company = profile.companies ? {
    id: profile.companies.id,
    name: profile.companies.name,
    domain: profile.companies.domain,
    logo: profile.companies.logo,
  } : null;

  // Build the profile object with company data
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    company_id: profile.company_id,
    companies: profile.companies,
    company, // Add the parsed company object
    isCompanyAdmin: false, // This will be set elsewhere if needed
  };
};

// Add the missing functions that are imported in AuthProvider.tsx

/**
 * Fetches a user's profile data from the profiles table
 */
export const fetchUserProfile = async (userId: string) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        companies:company_id (
          id,
          name,
          domain,
          logo
        )
      `)
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return parseProfile(data);
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

/**
 * Cleans up all Supabase auth related data from localStorage and sessionStorage
 * to prevent auth state inconsistencies
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};
