
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Upload, Link, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Video } from "@/types/training";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVideoUpload } from "@/hooks/useVideoUpload";

const VideoManagement = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    duration: "",
    module: ""
  });
  
  const { user } = useAuth();
  const { uploadVideo, uploadProgress, isUploading } = useVideoUpload();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("title");

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      toast.error(`Failed to fetch videos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      duration: "",
      module: ""
    });
    setVideoFile(null);
    setUploadMethod('url');
    setShowCreateDialog(true);
  };

  const handleOpenEditDialog = (video: Video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      url: video.url,
      duration: video.duration || "",
      module: video.module
    });
    setShowEditDialog(true);
  };

  const handleOpenDeleteDialog = (video: Video) => {
    setSelectedVideo(video);
    setShowDeleteDialog(true);
  };

  const handleCreateVideo = async () => {
    try {
      if (!formData.title) {
        toast.error("Video title is required");
        return;
      }

      if (!user?.id) {
        toast.error("You must be logged in to create a video");
        return;
      }

      if (uploadMethod === 'url' && !formData.url) {
        toast.error("Video URL is required");
        return;
      }

      if (uploadMethod === 'file' && !videoFile) {
        toast.error("Please select a video file to upload");
        return;
      }

      let videoData: Partial<Video> = {
        title: formData.title,
        description: formData.description || null,
        duration: formData.duration || "0:00",
        module: formData.module,
        created_by: user.id
      };

      // Handle file upload if needed
      if (uploadMethod === 'file' && videoFile) {
        const uploadResult = await uploadVideo(videoFile);
        
        if (!uploadResult) {
          toast.error("Failed to upload video file");
          return;
        }
        
        videoData.url = uploadResult.url;
        videoData.file_path = uploadResult.filePath;
        videoData.file_size = uploadResult.fileSize;
        videoData.thumbnail = uploadResult.thumbnail;
      } else {
        videoData.url = formData.url;
      }

      const { data, error } = await supabase
        .from("videos")
        .insert([videoData])
        .select();

      if (error) throw error;
      
      toast.success("Video created successfully");
      setShowCreateDialog(false);
      fetchVideos();
    } catch (error: any) {
      toast.error(`Failed to create video: ${error.message}`);
    }
  };

  const handleUpdateVideo = async () => {
    try {
      if (!selectedVideo) return;
      if (!formData.title) {
        toast.error("Video title is required");
        return;
      }

      let videoData: Partial<Video> = {
        title: formData.title,
        description: formData.description || null,
        duration: formData.duration || "0:00",
        module: formData.module
      };

      // Handle file upload if needed
      if (uploadMethod === 'file' && videoFile) {
        const uploadResult = await uploadVideo(videoFile);
        
        if (!uploadResult) {
          toast.error("Failed to upload video file");
          return;
        }
        
        videoData.url = uploadResult.url;
        videoData.file_path = uploadResult.filePath;
        videoData.file_size = uploadResult.fileSize;
        videoData.thumbnail = uploadResult.thumbnail;
      } else if (uploadMethod === 'url' && formData.url !== selectedVideo.url) {
        videoData.url = formData.url;
      }

      const { error } = await supabase
        .from("videos")
        .update(videoData)
        .eq("id", selectedVideo.id);

      if (error) throw error;
      
      toast.success("Video updated successfully");
      setShowEditDialog(false);
      fetchVideos();
    } catch (error: any) {
      toast.error(`Failed to update video: ${error.message}`);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      if (!selectedVideo) return;
      
      // First check if the video is used in any modules
      const { count, error: checkError } = await supabase
        .from('module_videos')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', selectedVideo.id);
        
      if (checkError) throw checkError;
      
      if (count && count > 0) {
        toast.error("Cannot delete video as it is used in one or more training modules");
        setShowDeleteDialog(false);
        return;
      }
      
      // Delete video from storage if file_path exists
      if (selectedVideo.file_path) {
        const { error: storageError } = await supabase.storage
          .from('training_videos')
          .remove([selectedVideo.file_path]);
          
        if (storageError) {
          console.error("Error removing video file:", storageError);
          // Continue with deletion even if storage removal fails
        }
      }
      
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", selectedVideo.id);

      if (error) throw error;
      
      toast.success("Video deleted successfully");
      setShowDeleteDialog(false);
      fetchVideos();
    } catch (error: any) {
      toast.error(`Failed to delete video: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Video Management</h2>
        <Button onClick={handleOpenCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader className="p-0">
              {video.thumbnail ? (
                <div className="aspect-video relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-slate-200 flex items-center justify-center">
                  <p className="text-slate-500">No thumbnail</p>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold truncate mr-4">{video.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Module: {video.module}
                  </p>
                  {video.duration && (
                    <p className="text-xs text-muted-foreground">
                      Duration: {video.duration}
                    </p>
                  )}
                </div>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEditDialog(video)}
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDeleteDialog(video)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {video.description && (
                <p className="text-sm mt-2 line-clamp-2">
                  {video.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No videos found</p>
          <p className="text-sm mt-2">Add your first video to get started</p>
        </div>
      )}
      
      {/* Create Video Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Video</DialogTitle>
          </DialogHeader>
          
          <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'url' | 'file')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center">
                <Link className="mr-2 h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Video Title</Label>
                <Input
                  id="title" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="module">Module</Label>
                <Input
                  id="module"
                  name="module"
                  value={formData.module}
                  onChange={handleInputChange}
                  placeholder="Enter module name"
                />
              </div>
              
              <TabsContent value="url">
                <div className="grid gap-2">
                  <Label htmlFor="url">Video URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="duration">Duration (optional)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 10:30"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="file">
                <div className="grid gap-2">
                  <Label htmlFor="video-file">Video File</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max file size: 500MB
                  </p>
                </div>
                
                {isUploading && (
                  <div className="mt-4">
                    <Label className="text-xs">Upload Progress</Label>
                    <Progress value={uploadProgress} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadProgress.toFixed(0)}% complete
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateVideo} 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : "Add Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Video Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          
          <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'url' | 'file')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="flex items-center">
                <Link className="mr-2 h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload New File
              </TabsTrigger>
            </TabsList>
            
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Video Title</Label>
                <Input
                  id="edit-title" 
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-module">Module</Label>
                <Input
                  id="edit-module"
                  name="module"
                  value={formData.module}
                  onChange={handleInputChange}
                />
              </div>
              
              <TabsContent value="url">
                <div className="grid gap-2">
                  <Label htmlFor="edit-url">Video URL</Label>
                  <Input
                    id="edit-url"
                    name="url"
                    type="url"
                    value={formData.url}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="file">
                <div className="grid gap-2">
                  <Label htmlFor="edit-video-file">New Video File</Label>
                  <Input
                    id="edit-video-file"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current file: {selectedVideo?.file_path ? selectedVideo.file_path.split('/').pop() : 'No file uploaded'}
                  </p>
                </div>
                
                {isUploading && (
                  <div className="mt-4">
                    <Label className="text-xs">Upload Progress</Label>
                    <Progress value={uploadProgress} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadProgress.toFixed(0)}% complete
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateVideo} 
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : "Update Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Video Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete the video "{selectedVideo?.title}"?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVideo}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoManagement;
