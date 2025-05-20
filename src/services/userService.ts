
import { supabase } from '@/integrations/supabase/client';

// Get all user profiles
export const getUserProfiles = async (filters = {}) => {
  try {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        companies:company_id (
          id,
          name
        )
      `);

    // Apply filters if provided
    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Process profiles without creating recursive structures
    return data.map(profile => {
      return {
        ...profile,
        company: profile.companies ? {
          id: profile.companies.id,
          name: profile.companies.name
        } : null
      };
    });
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    throw error;
  }
};

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
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
      throw error;
    }

    // Use a more direct approach to avoid recursive parsing
    if (data) {
      const profile = {
        ...data,
        company: data.companies ? {
          id: data.companies.id,
          name: data.companies.name,
          domain: data.companies.domain,
          logo: data.companies.logo,
        } : null
      };
      return profile;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Create user profile (typically called after auth signup)
export const createUserProfile = async (userData: any) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userData]);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get activity logs for a user
export const getUserActivityLogs = async (userId: string, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    throw error;
  }
};

// Get user with company information 
export const getUserWithCompany = async (userId: string) => {
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
      console.error('Error fetching user with company:', error);
      return null;
    }
    
    // Return the user with company data properly structured
    if (data) {
      return {
        ...data,
        company: data.companies ? {
          id: data.companies.id,
          name: data.companies.name,
          domain: data.companies.domain,
          logo: data.companies.logo,
        } : null,
        isCompanyAdmin: false // Default value
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user with company:', error);
    return null;
  }
};
