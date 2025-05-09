
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

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
      const filePath = path.startsWith(user.id) ? path : `${user.id}/${path}`;
      
      console.log(`Uploading file to ${bucketName}/${filePath}`);
      
      // Check if file already exists and remove it
      try {
        await supabase.storage
          .from(bucketName)
          .remove([filePath]);
      } catch (e) {
        // Ignore errors if file doesn't exist
        console.log("No previous file to remove or error removing:", e);
      }
      
      // Upload the new file
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Could not get public URL');
      }

      console.log(`File uploaded successfully: ${urlData.publicUrl}`);
      return urlData.publicUrl;
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
