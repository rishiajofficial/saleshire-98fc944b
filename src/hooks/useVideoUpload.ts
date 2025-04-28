
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseVideoUploadReturn {
  progress: number;
  error: string | null;
  isLoading: boolean;
  uploadFile: (file: File, path: string, onProgress?: (progress: number) => void) => Promise<any>;
  uploadVideo: (file: File) => Promise<any>; // Added missing property
  uploadProgress: number; // Added missing property
  isUploading: boolean; // Added missing property
}

const bucketName = process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || 'video-storage';

export const useVideoUpload = (): UseVideoUploadReturn => {
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0); // Added for consistent naming
  const [isUploading, setIsUploading] = useState<boolean>(false); // Added for consistent naming

  // Find the problematic upload function and fix the onUploadProgress issue
  const uploadFile = async (file: File, path: string, onProgress?: (progress: number) => void) => {
    try {
      setIsLoading(true);
      setProgress(0);
      setIsUploading(true);
      setUploadProgress(0);
      
      // Use a custom upload approach to handle progress
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      // Handle progress separately since onUploadProgress is not supported in the type
      if (onProgress) {
        // Since we can't use the native progress, we'll fake it for now
        onProgress(100);
      }
      
      setUploadProgress(100);
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Error uploading file:', error.message);
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
      setProgress(100);
      setIsUploading(false);
    }
  };

  // Add a specific function for uploading videos that VideoUploadDialog expects
  const uploadVideo = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create a unique path for the video
      const fileExt = file.name.split('.').pop();
      const filePath = `videos/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Update progress as we go
      let progress = 10;
      setUploadProgress(progress);
      
      // Simulate progress while uploading (since we can't get real progress)
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += 5;
          setUploadProgress(progress);
        }
      }, 300);
      
      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      // Return success data
      return {
        url: publicUrlData?.publicUrl || '',
        filePath,
        fileSize: file.size,
        thumbnail: null // We could generate a thumbnail here in the future
      };
    } catch (error: any) {
      console.error('Error uploading video:', error.message);
      setError(error.message);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { progress, error, isLoading, uploadFile, uploadVideo, uploadProgress, isUploading };
};
