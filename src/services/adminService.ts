
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
  }
};

export default AdminService;
