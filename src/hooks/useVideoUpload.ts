
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useVideoUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const uploadVideo = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload videos');
      return null;
    }

    try {
      setIsUploading(true);
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('training_videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(percent);
          },
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('training_videos')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        filePath,
        fileSize: file.size
      };
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(`Upload failed: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return { uploadVideo, uploadProgress, isUploading };
};
