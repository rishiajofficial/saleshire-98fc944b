import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Video } from '@/types/training';
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Upload, X } from 'lucide-react';

interface VideoManagementProps {
  onVideoCreated?: () => void;
  moduleId?: string;
}

const VideoManagement: React.FC<VideoManagementProps> = ({ onVideoCreated, moduleId }) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    duration: string;
    module: string;
    url: string;
    file_path?: string;
    file_size?: number;
    thumbnail?: string;
  }>({
    title: '',
    description: '',
    duration: '00:00',
    module: moduleId || '',
    url: '',
    file_path: '',
    file_size: 0,
    thumbnail: ''
  });
  
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
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploading(true);
      setProgress(0);
      
      // Update form with file info
      setFormData({
        ...formData,
        title: formData.title || file.name.split('.')[0],
        file_size: file.size,
        // If no URL is provided, we'll use a placeholder until the actual file is uploaded
        url: formData.url || URL.createObjectURL(file)
      });
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 200);
      
      // Insert video record
      if (user?.id) {
        const videoData = {
          title: formData.title || file.name.split('.')[0],
          description: formData.description,
          duration: formData.duration,
          module: formData.module,
          created_by: user.id,
          url: formData.url || 'https://example.com/placeholder-video',
          file_path: formData.file_path,
          file_size: formData.file_size,
          thumbnail: formData.thumbnail
        };
        
        const { data, error } = await supabase
          .from('videos')
          .insert([videoData]);
        
        if (error) throw error;
        
        clearInterval(interval);
        setProgress(100);
        
        toast.success('Video created successfully');
        setFormData({
          title: '',
          description: '',
          duration: '00:00',
          module: moduleId || '',
          url: '',
          file_path: '',
          file_size: 0,
          thumbnail: ''
        });
        
        if (onVideoCreated) {
          onVideoCreated();
        }
        
        fetchVideos();
      }
    } catch (error: any) {
      console.error('Error uploading video:', error);
      toast.error(`Failed to upload video: ${error.message}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required');
      return;
    }
    
    try {
      setUploading(true);
      
      if (user?.id) {
        const videoData = {
          title: formData.title,
          description: formData.description,
          duration: formData.duration,
          module: formData.module,
          created_by: user.id,
          url: formData.url,
          file_path: formData.file_path,
          file_size: formData.file_size,
          thumbnail: formData.thumbnail
        };
        
        const { data, error } = await supabase
          .from('videos')
          .insert([videoData]);
        
        if (error) throw error;
        
        toast.success('Video created successfully');
        setFormData({
          title: '',
          description: '',
          duration: '00:00',
          module: moduleId || '',
          url: '',
          file_path: '',
          file_size: 0,
          thumbnail: ''
        });
        
        if (onVideoCreated) {
          onVideoCreated();
        }
        
        fetchVideos();
      }
    } catch (error: any) {
      console.error('Error creating video:', error);
      toast.error(`Failed to create video: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  
  const confirmDeleteVideo = (videoId: string) => {
    setVideoToDelete(videoId);
    setShowDeleteDialog(true);
  };
  
  const deleteVideo = async (videoId: string) => {
    try {
      // First, delete any related progress entries
      const { error: progressError } = await supabase
        .from('training_progress')
        .delete()
        .eq('video_id', videoId);
        
      if (progressError) {
        console.error('Error deleting related progress entries:', progressError);
        toast.error(`Failed to delete related progress: ${progressError.message}`);
        return;
      }
      
      // Then delete any category_videos relationships
      const { error: categoryVideosError } = await supabase
        .from('category_videos')
        .delete()
        .eq('video_id', videoId);
        
      if (categoryVideosError) {
        console.error('Error deleting category video relationships:', categoryVideosError);
        toast.error(`Failed to delete category relationships: ${categoryVideosError.message}`);
        return;
      }
      
      // Then delete any module_videos relationships
      const { error: moduleVideosError } = await supabase
        .from('module_videos')
        .delete()
        .eq('video_id', videoId);
        
      if (moduleVideosError) {
        console.error('Error deleting module video relationships:', moduleVideosError);
        toast.error(`Failed to delete module relationships: ${moduleVideosError.message}`);
        return;
      }
      
      // Finally delete the video itself
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
        
      if (error) throw error;
      
      toast.success('Video deleted successfully');
      fetchVideos();
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting video:', error);
      toast.error(`Failed to delete video: ${error.message}`);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-md shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Video title"
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration (MM:SS)</Label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="00:00"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Video description"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="url">Video URL</Label>
          <Input
            id="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://example.com/video"
          />
        </div>
        
        <div>
          <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
          <Input
            id="thumbnail"
            name="thumbnail"
            value={formData.thumbnail || ''}
            onChange={handleInputChange}
            placeholder="https://example.com/thumbnail"
          />
        </div>
        
        <div>
          <Label htmlFor="videoFile" className="block mb-2">
            Or upload a video file
          </Label>
          <Input
            id="videoFile"
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="cursor-pointer"
          />
          
          {progress > 0 && (
            <div className="mt-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500 mt-1">{progress}% uploaded</p>
            </div>
          )}
        </div>
        
        <Button type="submit" disabled={uploading || !formData.title || !formData.url}>
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" /> Add Video
            </>
          )}
        </Button>
      </form>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Videos</h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="border rounded-md p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => confirmDeleteVideo(video.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {video.thumbnail ? (
                  <img src={video.thumbnail} alt={video.title} className="w-full h-32 object-cover mb-2 rounded" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center mb-2 rounded">
                    <span className="text-gray-400">No thumbnail</span>
                  </div>
                )}
                <h4 className="font-medium truncate">{video.title}</h4>
                <p className="text-sm text-gray-500 truncate">{video.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-400">Duration: {video.duration || 'Unknown'}</span>
                  <a 
                    href={video.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Watch
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No videos found</p>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this video? This will also remove all training progress related to this video.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => videoToDelete && deleteVideo(videoToDelete)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoManagement;
