
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useSupabaseStorage = (bucketName: 'resumes' | 'videos' | 'candidate-videos') => {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    if (!user) {
      toast.error('You must be logged in to upload files');
      return null;
    }

    try {
      setIsUploading(true);
      
      // Ensure the path includes the user ID for proper RLS
      const filePath = `${user.id}/${path}`;
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!data?.publicUrl) {
        throw new Error('Could not get public URL');
      }

      return data.publicUrl;
    } catch (error: any) {
      console.error('Storage error:', error);
      toast.error(error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
};
