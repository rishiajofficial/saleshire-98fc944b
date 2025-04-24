import { supabase } from "@/integrations/supabase/client";
import { BaseService, ServiceResponse } from "./baseService";

export type ContentData = {
  id?: string;
  title: string;
  description?: string;
  content?: string;
  difficulty?: string;
  module?: string; 
  name?: string;
  [key: string]: any;
};

export const ContentService = {
  async createContent(
    contentType: 'assessment' | 'video' | 'training_module' | 'training_category',
    data: ContentData
  ): Promise<ServiceResponse> {
    try {
      console.log(`Creating ${contentType}:`, data);
      
      if (contentType === 'assessment') {
        const { data: result, error } = await supabase
          .from('assessments')
          .insert({
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            created_by: data.createdBy
          })
          .select()
          .single();
        
        if (error) throw error;
        
        console.log(`${contentType} created successfully:`, result);
        return { success: true, data: result };
      } else if (contentType === 'training_category') {
        const { data: result, error } = await supabase
          .from('training_categories')
          .insert({
            name: data.title || data.name,
            description: data.description,
            created_by: data.createdBy
          })
          .select()
          .single();
        
        if (error) throw error;
        
        console.log(`${contentType} created successfully:`, result);
        return { success: true, data: result };
      } else {
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
  
  async updateContent(
    contentType: 'assessment' | 'video' | 'training_module' | 'training_category',
    id: string,
    data: ContentData
  ): Promise<ServiceResponse> {
    try {
      console.log(`Updating ${contentType} ${id}:`, data);
      
      if (contentType === 'assessment') {
        const { data: result, error } = await supabase
          .from('assessments')
          .update({
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        console.log(`${contentType} updated successfully:`, result);
        return { success: true, data: result };
      } else if (contentType === 'training_category') {
        const { data: result, error } = await supabase
          .from('training_categories')
          .update({
            name: data.title || data.name,
            description: data.description
          })
          .eq('id', id)
          .select()
          .single();
        
        if (error) throw error;
        
        console.log(`${contentType} updated successfully:`, result);
        return { success: true, data: result };
      } else {
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
  
  async deleteContent(
    contentType: 'assessment' | 'video' | 'training_module' | 'training_category',
    id: string
  ): Promise<ServiceResponse> {
    try {
      console.log(`Deleting ${contentType} ${id}`);
      
      if (contentType === 'assessment') {
        const { error } = await supabase
          .from('assessments')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        console.log(`${contentType} deleted successfully`);
        return { success: true };
      } else if (contentType === 'training_category') {
        const { error } = await supabase
          .from('training_categories')
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
  
  async getTrainingCategories(): Promise<ServiceResponse> {
    try {
      const { data, error } = await supabase
        .from('training_categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      console.error(`Error fetching training categories:`, error.message);
      return { success: false, error: error.message };
    }
  },
  
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
  },
  
  async createTrainingCategory(
    data: ContentData
  ): Promise<ServiceResponse> {
    try {
      const { data: result, error } = await supabase
        .from('training_categories')
        .insert({
          name: data.title || data.name,
          description: data.description,
          created_by: data.createdBy
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Training category created successfully:', result);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error creating training category:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  async updateTrainingCategory(
    id: string,
    data: ContentData
  ): Promise<ServiceResponse> {
    try {
      const { data: result, error } = await supabase
        .from('training_categories')
        .update({
          name: data.title || data.name,
          description: data.description
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Training category updated successfully:', result);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error updating training category:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  async deleteTrainingCategory(
    id: string
  ): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from('training_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      console.log('Training category deleted successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting training category:', error.message);
      return { success: false, error: error.message };
    }
  },
  
  async createTrainingModule(
    data: ContentData
  ): Promise<ServiceResponse> {
    try {
      const { data: result, error } = await supabase
        .from('training_modules')
        .insert({
          title: data.title,
          description: data.description,
          created_by: data.createdBy,
          module: data.module,
          is_quiz: data.is_quiz || false,
          content: data.content,
          video_url: data.video_url
        })
        .select()
        .single();
      
      if (error) throw error;
      
      console.log('Training module created successfully:', result);
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error creating training module:', error.message);
      return { success: false, error: error.message };
    }
  }
};

export default ContentService;
