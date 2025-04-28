
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const useVideoUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const extractThumbnail = async (videoFile: File): Promise<string | null> => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const url = URL.createObjectURL(videoFile);
      video.src = url;
      
      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          // Seek to a frame at 25% of the video
          video.currentTime = Math.min(video.duration * 0.25, 5); // Seek to 25% or 5 seconds, whichever is less
          
          video.onseeked = () => {
            // Create a canvas and draw the current video frame
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Convert to data URL and clean up
              const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
              URL.revokeObjectURL(url);
              
              resolve(thumbnailDataUrl);
            } else {
              URL.revokeObjectURL(url);
              resolve(null);
            }
          };
        };
        
        video.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
      });
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      return null;
    }
  };

  // Function to upload a thumbnail image
  const uploadThumbnail = async (
    thumbnailDataUrl: string, 
    userId: string, 
    videoFileName: string
  ): Promise<string | null> => {
    try {
      // Convert data URL to Blob
      const response = await fetch(thumbnailDataUrl);
      const blob = await response.blob();
      
      // Create a File from the Blob (easier to handle with Supabase storage)
      const thumbnailFile = new File(
        [blob], 
        `${videoFileName.split('.')[0]}_thumbnail.jpg`,
        { type: 'image/jpeg' }
      );
      
      const filePath = `${userId}/thumbnails/${Date.now()}_${thumbnailFile.name}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('training_videos')
        .upload(filePath, thumbnailFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('training_videos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
      
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      return null;
    }
  };

  const uploadVideo = async (file: File) => {
    if (!user) {
      toast.error('You must be logged in to upload videos');
      return null;
    }

    try {
      setIsUploading(true);
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      
      // Generate thumbnail
      const thumbnailDataUrl = await extractThumbnail(file);
      let thumbnailUrl = null;
      
      if (thumbnailDataUrl) {
        thumbnailUrl = await uploadThumbnail(thumbnailDataUrl, user.id, file.name);
      }
      
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
        fileSize: file.size,
        thumbnail: thumbnailUrl
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
