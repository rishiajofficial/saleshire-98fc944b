
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupabaseStorage = (bucketName: 'resumes' | 'videos' | 'candidate-videos') => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(path);

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
