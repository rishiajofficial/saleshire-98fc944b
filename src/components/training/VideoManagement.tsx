
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Video } from '@/types/training';
import { toast } from 'sonner';
import VideoForm from './video/VideoForm';
import VideoList from './video/VideoList';
import DeleteVideoDialog from './video/DeleteVideoDialog';

interface VideoManagementProps {
  onVideoCreated?: () => void;
  moduleId?: string;
}

const VideoManagement: React.FC<VideoManagementProps> = ({ onVideoCreated, moduleId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    fetchVideos();
  }, [moduleId]);
  
  const fetchVideos = async () => {
    try {
      setLoading(true);
      let query = supabase.from('videos').select('*');
      
      if (moduleId) {
        query = query.eq('module', moduleId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setVideos(data as Video[] || []);
    } catch (error: any) {
      console.error('Error fetching videos:', error);
      toast.error(`Failed to fetch videos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const confirmDeleteVideo = (videoId: string) => {
    setVideoToDelete(videoId);
    setShowDeleteDialog(true);
  };
  
  const deleteVideo = async () => {
    if (!videoToDelete) return;
    
    try {
      console.log(`Starting video deletion process for video ID: ${videoToDelete}`);
      
      // Step 1: Delete training_progress entries first
      console.log("Checking for training_progress entries");
      const { data: progressData, error: progressCheckError } = await supabase
        .from('training_progress')
        .select('id')
        .eq('video_id', videoToDelete);
        
      if (progressCheckError) {
        console.error('Error checking related progress entries:', progressCheckError);
        toast.error(`Failed to check related progress: ${progressCheckError.message}`);
        return;
      }
      
      if (progressData && progressData.length > 0) {
        console.log(`Found ${progressData.length} training_progress entries to delete`);
        const { error: deleteProgressError } = await supabase
          .from('training_progress')
          .delete()
          .eq('video_id', videoToDelete);
          
        if (deleteProgressError) {
          console.error('Error deleting related progress entries:', deleteProgressError);
          toast.error(`Failed to delete related progress: ${deleteProgressError.message}`);
          return;
        }
        console.log("Successfully deleted training_progress entries");
      } else {
        console.log("No training_progress entries found");
      }
      
      // Step 2: Delete category_videos relationships
      console.log("Deleting category_videos entries");
      const { error: categoryVideosError } = await supabase
        .from('category_videos')
        .delete()
        .eq('video_id', videoToDelete);
        
      if (categoryVideosError && categoryVideosError.code !== 'PGRST116') {
        console.error('Error deleting category video relationships:', categoryVideosError);
        toast.error(`Failed to delete category relationships: ${categoryVideosError.message}`);
        return;
      }
      console.log("Successfully deleted or no category_videos entries found");
      
      // Step 3: Delete module_videos relationships
      console.log("Deleting module_videos entries");
      const { error: moduleVideosError } = await supabase
        .from('module_videos')
        .delete()
        .eq('video_id', videoToDelete);
        
      if (moduleVideosError && moduleVideosError.code !== 'PGRST116') {
        console.error('Error deleting module video relationships:', moduleVideosError);
        toast.error(`Failed to delete module relationships: ${moduleVideosError.message}`);
        return;
      }
      console.log("Successfully deleted or no module_videos entries found");
      
      // Step 4: Finally delete the video itself
      console.log("Deleting video record");
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoToDelete);
        
      if (error) {
        console.error('Error deleting video:', error);
        toast.error(`Failed to delete video: ${error.message}`);
        return;
      }
      
      console.log("Video successfully deleted");
      toast.success('Video deleted successfully');
      fetchVideos();
      setShowDeleteDialog(false);
      setVideoToDelete(null);
    } catch (error: any) {
      console.error('Error in deletion process:', error);
      toast.error(`Failed to delete video: ${error.message}`);
    }
  };

  const handleVideoCreated = () => {
    fetchVideos();
    if (onVideoCreated) {
      onVideoCreated();
    }
  };

  return (
    <div className="w-full">
      <VideoForm moduleId={moduleId} onVideoCreated={handleVideoCreated} />
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Videos</h3>
        <VideoList 
          videos={videos} 
          loading={loading} 
          onDeleteClick={confirmDeleteVideo} 
        />
      </div>
      
      <DeleteVideoDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirmDelete={deleteVideo}
      />
    </div>
  );
};

export default VideoManagement;
