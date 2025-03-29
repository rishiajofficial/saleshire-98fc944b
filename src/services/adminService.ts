
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
      
      // For assessments, directly insert into the database
      if (contentType === 'assessment') {
        const { data: result, error } = await supabase
          .from('assessments')
          .insert({
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            time_limit: data.timeLimit ? parseInt(data.timeLimit) : null,
            prevent_backtracking: data.preventBacktracking || false,
            randomize_questions: data.randomizeQuestions || false,
            created_by: data.createdBy
          })
          .select()
          .single();
        
        if (error) throw error;
        
        console.log(`${contentType} created successfully:`, result);
        return { success: true, data: result };
      } else {
        // For other content types, use the edge function
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
      }
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
      
      // For assessments, directly update the database
      if (contentType === 'assessment') {
        const { data: result, error } = await supabase
          .from('assessments')
          .update({
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            time_limit: data.timeLimit ? parseInt(data.timeLimit) : null,
            prevent_backtracking: data.preventBacktracking || false,
            randomize_questions: data.randomizeQuestions || false,
            updated_at: new Date().toISOString() // Convert Date to string
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        console.log(`${contentType} updated successfully:`, result);
        return { success: true, data: result };
      } else {
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
      }
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
      
      // For assessments, directly delete from the database
      if (contentType === 'assessment') {
        const { error } = await supabase
          .from('assessments')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        console.log(`${contentType} deleted successfully`);
        return { success: true };
      } else {
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
      }
    } catch (error: any) {
      console.error(`Error deleting ${contentType}:`, error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Fetch assessment results
  async getAssessmentResults(assessmentId: string): Promise<AdminServiceResponse> {
    try {
      console.log(`Fetching results for assessment ${assessmentId}`);
      
      const { data, error } = await supabase
        .from('assessment_results')
        .select(`
          *,
          candidate:candidate_id(
            id,
            profiles:id(name, email)
          )
        `)
        .eq('assessment_id', assessmentId);
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error(`Error fetching assessment results:`, error.message);
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
