
import { supabase } from '@/integrations/supabase/client';

/**
 * Cleans up authentication state from local and session storage
 * to prevent auth issues and state conflicts
 */
export const cleanupAuthState = () => {
  // Clear any stored session data
  sessionStorage.clear();
  
  // Clean up localStorage items related to auth to prevent stale data
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Fetches user profile data from Supabase
 */
export const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }
    
    // Now fetch additional role-specific data
    let additionalData = null;
    if (data.role === 'candidate') {
      const { data: candidateData, error: candidateError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!candidateError && candidateData) {
        additionalData = { candidateData };
      }
    } else if (data.role === 'manager') {
      const { data: managerData, error: managerError } = await supabase
        .from('managers')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (!managerError && managerData) {
        additionalData = { managerData };
      }
    }
    
    return additionalData ? { ...data, ...additionalData } : data;
  } catch (error: any) {
    console.error('Error fetching profile:', error.message);
    return null;
  }
};

/**
 * Get dashboard route based on user role
 */
export const getDashboardRouteByRole = (role?: string) => {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'manager':
      return '/dashboard/manager';
    case 'hr':
      return '/dashboard/hr';
    case 'director':
      return '/dashboard/director';
    case 'candidate':
    default:
      return '/dashboard/candidate';
  }
};
