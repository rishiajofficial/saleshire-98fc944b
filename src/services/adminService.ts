
import { supabase } from "@/integrations/supabase/client";

export interface ContentData {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  [key: string]: any;
}

export interface AdminServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface UserData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'candidate';
  region?: string;
}

// Admin service for content management
export const AdminService = {
  // Create new content
  async createContent(
    contentType: 'assessment' | 'video' | 'training_module',
    data: ContentData
  ): Promise<AdminServiceResponse> {
    try {
      console.log(`Creating ${contentType}:`, data);
      
      const { data: response, error } = await supabase.functions.invoke("admin-operations", {
        body: {
          operation: "updateContent",
          data: {
            contentType,
            action: 'create',
            data
          }
        }
      });
      
      if (error) throw error;
      if (!response.success) throw new Error(response.error || `Failed to create ${contentType}`);
      
      console.log(`${contentType} created successfully:`, response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`Error creating ${contentType}:`, error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Update existing content
  async updateContent(
    contentType: 'assessment' | 'video' | 'training_module',
    id: string,
    data: ContentData
  ): Promise<AdminServiceResponse> {
    try {
      console.log(`Updating ${contentType} ${id}:`, data);
      
      // Ensure ID is included in the data
      const contentData = { ...data, id };
      
      const { data: response, error } = await supabase.functions.invoke("admin-operations", {
        body: {
          operation: "updateContent",
          data: {
            contentType,
            action: 'update',
            data: contentData
          }
        }
      });
      
      if (error) throw error;
      if (!response.success) throw new Error(response.error || `Failed to update ${contentType}`);
      
      console.log(`${contentType} updated successfully:`, response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`Error updating ${contentType}:`, error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Delete content
  async deleteContent(
    contentType: 'assessment' | 'video' | 'training_module',
    id: string
  ): Promise<AdminServiceResponse> {
    try {
      console.log(`Deleting ${contentType} ${id}`);
      
      const { data: response, error } = await supabase.functions.invoke("admin-operations", {
        body: {
          operation: "updateContent",
          data: {
            contentType,
            action: 'delete',
            data: { id }
          }
        }
      });
      
      if (error) throw error;
      if (!response.success) throw new Error(response.error || `Failed to delete ${contentType}`);
      
      console.log(`${contentType} deleted successfully`);
      return { success: true };
    } catch (error: any) {
      console.error(`Error deleting ${contentType}:`, error.message);
      return { success: false, error: error.message };
    }
  },

  // User Management Functions
  async createUser(userData: UserData): Promise<AdminServiceResponse> {
    try {
      console.log('Creating user:', userData);
      
      const { data: response, error } = await supabase.functions.invoke("admin-operations", {
        body: {
          operation: "createUser",
          data: userData
        }
      });
      
      if (error) throw error;
      if (!response.success) throw new Error(response.error || 'Failed to create user');
      
      console.log('User created successfully:', response.user);
      return { success: true, data: response.user };
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  async updateUser(userData: UserData): Promise<AdminServiceResponse> {
    try {
      console.log('Updating user:', userData);
      
      if (!userData.id) {
        throw new Error('User ID is required for update');
      }
      
      const { data: response, error } = await supabase.functions.invoke("admin-operations", {
        body: {
          operation: "updateUser",
          data: userData
        }
      });
      
      if (error) throw error;
      if (!response.success) throw new Error(response.error || 'Failed to update user');
      
      console.log('User updated successfully');
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Error updating user:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  async deleteUser(userId: string): Promise<AdminServiceResponse> {
    try {
      console.log('Deleting user:', userId);
      
      const { data: response, error } = await supabase.functions.invoke("admin-operations", {
        body: {
          operation: "deleteUser",
          data: { userId }
        }
      });
      
      if (error) throw error;
      if (!response.success) throw new Error(response.error || 'Failed to delete user');
      
      console.log('User deleted successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  async getUser(userId: string): Promise<AdminServiceResponse> {
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

export default AdminService;
