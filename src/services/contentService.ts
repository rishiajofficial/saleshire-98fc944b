
import { supabase } from "@/integrations/supabase/client";
import { BaseService, ServiceResponse } from "./baseService";

export type ContentData = {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  [key: string]: any;
};

// Content management service
export const ContentService = {
  // Create new content
  async createContent(
    contentType: 'assessment' | 'video' | 'training_module',
    data: ContentData
  ): Promise<ServiceResponse> {
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
        return await BaseService.invokeFunction("admin-operations", {
          operation: "updateContent",
          data: {
            contentType,
            action: 'create',
            data
          }
        });
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
  ): Promise<ServiceResponse> {
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
        
        return await BaseService.invokeFunction("admin-operations", {
          operation: "updateContent",
          data: {
            contentType,
            action: 'update',
            data: contentData
          }
        });
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
  ): Promise<ServiceResponse> {
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
        return await BaseService.invokeFunction("admin-operations", {
          operation: "updateContent",
          data: {
            contentType,
            action: 'delete',
            data: { id }
          }
        });
      }
    } catch (error: any) {
      console.error(`Error deleting ${contentType}:`, error.message);
      return { success: false, error: error.message };
    }
  },
  
  // Fetch assessment results
  async getAssessmentResults(assessmentId: string): Promise<ServiceResponse> {
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
  }
};

export default ContentService;
