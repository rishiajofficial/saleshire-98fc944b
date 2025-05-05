
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
  
  const handleVideoDeleted = () => {
    fetchVideos();
    setShowDeleteDialog(false);
    setVideoToDelete(null);
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
        onConfirmDelete={handleVideoDeleted}
        videoId={videoToDelete}
      />
    </div>
  );
};

export default VideoManagement;
