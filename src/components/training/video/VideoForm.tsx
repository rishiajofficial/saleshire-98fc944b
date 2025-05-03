
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload } from 'lucide-react';

interface VideoFormProps {
  moduleId?: string;
  onVideoCreated: () => void;
}

const VideoForm: React.FC<VideoFormProps> = ({ moduleId, onVideoCreated }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
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
        
        onVideoCreated();
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
        
        onVideoCreated();
      }
    } catch (error: any) {
      console.error('Error creating video:', error);
      toast.error(`Failed to create video: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
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
  );
};

export default VideoForm;
