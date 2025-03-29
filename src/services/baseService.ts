
import { supabase } from "@/integrations/supabase/client";

export interface ServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Base service with common utility functions
export const BaseService = {
  // Helper to invoke edge functions with proper error handling
  async invokeFunction(functionName: string, body: any): Promise<ServiceResponse> {
    try {
      const { data: response, error } = await supabase.functions.invoke(functionName, {
        body
      });
      
      if (error) throw error;
      if (!response.success) throw new Error(response.error || `Function ${functionName} failed`);
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error(`Error invoking function ${functionName}:`, error.message);
      return { success: false, error: error.message };
    }
  }
};

export default BaseService;
