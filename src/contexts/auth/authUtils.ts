
import { supabase } from '@/integrations/supabase/client';

// Helper function to clean up auth state
export const cleanupAuthState = () => {
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

// Fetch user profile including company information if available
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        id, 
        name, 
        email, 
        role, 
        company_id,
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
      console.error('Error fetching profile:', error.message);
      return null;
    }
    
    // Check if user is a company admin
    if (profile.company_id) {
      const { data: isAdmin } = await supabase.rpc('is_company_admin', {
        company_uuid: profile.company_id,
        user_uuid: userId
      });
      
      // Add isCompanyAdmin flag to the profile object
      const enhancedProfile = { ...profile, isCompanyAdmin: isAdmin };
      
      // Format the returned data for easier access
      if (enhancedProfile.companies) {
        enhancedProfile.company = enhancedProfile.companies;
        delete enhancedProfile.companies;
      }
      
      return enhancedProfile;
    }
    
    // For users without company, normalize and return
    return parseProfile(profile);
  } catch (error: any) {
    console.error('Error in fetchUserProfile:', error.message);
    return null;
  }
};

export const parseProfile = (profile: any) => {
  if (!profile) {
    return null;
  }

  // Normalize companies to company for easier access
  let normalizedProfile = { ...profile };
  
  // If companies property exists, assign to company property
  if (profile.companies) {
    normalizedProfile.company = profile.companies;
    delete normalizedProfile.companies;
  }

  // Add isCompanyAdmin flag if not already set
  if (normalizedProfile.isCompanyAdmin === undefined) {
    normalizedProfile.isCompanyAdmin = false;
  }
  
  return normalizedProfile;
};
