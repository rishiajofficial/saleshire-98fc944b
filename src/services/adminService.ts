
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
};

// Admin service for managing users
const AdminService = {
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
  },
  
  // Update user email - special method to handle auth email updates
  async updateUserEmail(userId: string, newEmail: string): Promise<ServiceResponse> {
    try {
      console.log('Updating user email:', userId, newEmail);
      
      return await BaseService.invokeFunction("admin-operations", {
        operation: "updateUserEmail",
        data: { userId, email: newEmail }
      });
    } catch (error: any) {
      console.error('Error updating user email:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Update user status
  async updateUserStatus(userId: string, status: string): Promise<ServiceResponse> {
    try {
      console.log('Updating user status:', userId, status);
      
      // Since we don't have a status column in the profiles table yet, 
      // we'll update it via the admin-operations function
      return await BaseService.invokeFunction("admin-operations", {
        operation: "updateUserStatus",
        data: { userId, status }
      });
    } catch (error: any) {
      console.error('Error updating user status:', error.message);
      return { success: false, error: error.message };
    }
  }
};

export default AdminService;
