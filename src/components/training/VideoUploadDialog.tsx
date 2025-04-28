
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { toast } from "sonner";
import { Video, Upload, Link as LinkIcon } from "lucide-react";

interface VideoUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onVideoAdded: (videoData: { 
    url: string; 
    title: string; 
    description: string;
    duration: string;
    filePath?: string; 
    fileSize?: number;
    thumbnail?: string;
  }) => void;
}

export const VideoUploadDialog = ({ open, onClose, onVideoAdded }: VideoUploadDialogProps) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload'); 
  const { uploadVideo, uploadProgress, isUploading } = useVideoUpload();

  const resetForm = () => {
    setVideoUrl('');
    setTitle('');
    setDescription('');
    setDuration('');
    setActiveTab('upload');
  };

  const handleVideoUrlSubmit = () => {
    if (!videoUrl || !title) {
      toast.error("Title and URL are required");
      return;
    }
    
    onVideoAdded({ 
      url: videoUrl, 
      title, 
      description, 
      duration 
    });
    
    resetForm();
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!title) {
      // Try to use filename as title if no title provided
      const fileName = file.name.split('.')[0]
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
      setTitle(fileName);
    }

    const result = await uploadVideo(file);
    if (result) {
      onVideoAdded({
        url: result.url,
        title,
        description, 
        duration,
        filePath: result.filePath,
        fileSize: result.fileSize,
        thumbnail: result.thumbnail
      });
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Details */}
          <div className="space-y-4">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video description"
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (optional)</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 5:30"
              disabled={isUploading}
            />
          </div>

          {/* Upload/Link Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${activeTab === 'upload' ? 'border-b-2 border-primary font-medium text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('upload')}
              type="button"
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 inline mr-2" />
              Upload File
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'link' ? 'border-b-2 border-primary font-medium text-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('link')}
              type="button"
              disabled={isUploading}
            >
              <LinkIcon className="h-4 w-4 inline mr-2" />
              Video URL
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <Input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading: {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Link Tab */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <Button
                onClick={handleVideoUrlSubmit}
                disabled={!videoUrl || !title || isUploading}
                className="w-full"
              >
                <Video className="h-4 w-4 mr-2" />
                Add Video Link
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
