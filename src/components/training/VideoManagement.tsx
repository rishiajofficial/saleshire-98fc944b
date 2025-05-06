
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Video } from '@/types/training';
import { toast } from 'sonner';
import VideoForm from './video/VideoForm';
import VideoList from './video/VideoList';
import DeleteVideoDialog from './video/DeleteVideoDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VideoManagementProps {
  onVideoCreated?: () => void;
  moduleId?: string;
}

const VideoManagement: React.FC<VideoManagementProps> = ({ onVideoCreated, moduleId }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [showAddVideoDialog, setShowAddVideoDialog] = useState(false);
  
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
    setShowAddVideoDialog(false);
    if (onVideoCreated) {
      onVideoCreated();
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium">Videos</h3>
        <Button onClick={() => setShowAddVideoDialog(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>
      
      <VideoList 
        videos={videos} 
        loading={loading} 
        onDeleteClick={confirmDeleteVideo} 
      />
      
      <Dialog open={showAddVideoDialog} onOpenChange={setShowAddVideoDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add New Video</DialogTitle>
          </DialogHeader>
          <VideoForm moduleId={moduleId} onVideoCreated={handleVideoCreated} />
        </DialogContent>
      </Dialog>
      
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
