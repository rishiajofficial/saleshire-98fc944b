
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { Video, Upload } from "lucide-react";

interface VideoUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onVideoAdded: (videoData: { url: string; filePath?: string; fileSize?: number }) => void;
}

export const VideoUploadDialog = ({ open, onClose, onVideoAdded }: VideoUploadDialogProps) => {
  const [videoUrl, setVideoUrl] = useState('');
  const { uploadVideo, uploadProgress, isUploading } = useVideoUpload();

  const handleVideoUrlSubmit = () => {
    if (!videoUrl) {
      return;
    }
    onVideoAdded({ url: videoUrl });
    setVideoUrl('');
    onClose();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadVideo(file);
    if (result) {
      onVideoAdded(result);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Video</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Video URL</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter video URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <Button onClick={handleVideoUrlSubmit} disabled={!videoUrl || isUploading}>
                <Video className="h-4 w-4 mr-2" />
                Add URL
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Upload Video</Label>
            <div className="flex flex-col gap-4">
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
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
