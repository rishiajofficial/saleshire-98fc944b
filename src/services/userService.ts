import { supabase } from "@/integrations/supabase/client";
import { BaseService, ServiceResponse } from "./baseService";

export type UserRole = 'admin' | 'manager' | 'candidate' | 'hr' | 'director';

export type UserData = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  region?: string;
  company_id?: string;
};

// User management service
export const UserService = {
  // Create new user
  async createUser(userData: UserData): Promise<ServiceResponse> {
    try {
      console.log('Creating user:', userData);
      
      return await BaseService.invokeFunction("admin-operations", {
        operation: "createUser",
        data: userData
      });
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Update existing user
  async updateUser(userData: UserData): Promise<ServiceResponse> {
    try {
      console.log('Updating user:', userData);
      
      if (!userData.id) {
        throw new Error('User ID is required for update');
      }
      
      return await BaseService.invokeFunction("admin-operations", {
        operation: "updateUser",
        data: userData
      });
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Delete user
  async deleteUser(userId: string): Promise<ServiceResponse> {
    try {
      console.log('Deleting user:', userId);
      
      return await BaseService.invokeFunction("admin-operations", {
        operation: "deleteUser",
        data: { userId }
      });
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Get user details
  async getUser(userId: string): Promise<ServiceResponse> {
    try {
      console.log('Getting user details:', userId);
      
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
      
      if (error) throw error;
      if (!data) throw new Error('User not found');
      
      // Normalize companies to company for easier access
      const normalizedData = { ...data };
      if (normalizedData.companies) {
        normalizedData.company = normalizedData.companies;
        delete normalizedData.companies;
      }
      
      return { success: true, data: normalizedData };
    } catch (error: any) {
      console.error('Error getting user details:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Get users by company
  async getUsersByCompany(companyId: string): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId);
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting company users:', error.message);
      return { success: false, error: error.message };
    }
  }
};

export default UserService;

export const normalizeProfile = (profileData: any) => {
  if (!profileData) return null;
  
  // Create a normalized copy of the profile data
  const normalized = { ...profileData };
  
  // Convert companies field to company for consistency
  if (profileData.companies && !profileData.company) {
    normalized.company = profileData.companies;
    delete normalized.companies;
  }
  
  return normalized;
};
