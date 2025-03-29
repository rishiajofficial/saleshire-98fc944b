
import { supabase } from "@/integrations/supabase/client";
import { BaseService, ServiceResponse } from "./baseService";

export type UserData = {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'candidate';
  region?: string;
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
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('User not found');
      
      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting user details:', error.message);
      return { success: false, error: error.message };
    }
  }
};

export default UserService;
