
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2, Clock } from "lucide-react";
import { Video } from "@/types/training";
import { Loader2 } from "lucide-react";

const VideoManagement = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    duration: "",
  });
  const { user } = useAuth();

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

  const handleOpenAddDialog = () => {
    setFormData({
      title: "",
      description: "",
      url: "",
      duration: "",
    });
    setShowAddDialog(true);
  };

  const handleOpenEditDialog = (video: Video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description || "",
      url: video.url,
      duration: video.duration || "",
    });
    setShowEditDialog(true);
  };

  const handleOpenDeleteDialog = (video: Video) => {
    setSelectedVideo(video);
    setShowDeleteDialog(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddVideo = async () => {
    try {
      if (!formData.title || !formData.url) {
        toast.error("Title and URL are required");
        return;
      }

      const { data, error } = await supabase.from("videos").insert({
        title: formData.title,
        description: formData.description || null,
        url: formData.url,
        duration: formData.duration || null,
        created_by: user?.id,
        module: ""  // Legacy field, keeping for compatibility
      }).select();

      if (error) throw error;
      toast.success("Video added successfully");
      setShowAddDialog(false);
      fetchVideos();
    } catch (error: any) {
      toast.error(`Failed to add video: ${error.message}`);
    }
  };

  const handleUpdateVideo = async () => {
    try {
      if (!selectedVideo) return;
      if (!formData.title || !formData.url) {
        toast.error("Title and URL are required");
        return;
      }

      const { error } = await supabase
        .from("videos")
        .update({
          title: formData.title,
          description: formData.description || null,
          url: formData.url,
          duration: formData.duration || null,
        })
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

      // First check if video is used in any modules
      const { data: moduleVideos, error: checkError } = await supabase
        .from("module_videos")
        .select("module_id")
        .eq("video_id", selectedVideo.id);

      if (checkError) throw checkError;

      if (moduleVideos && moduleVideos.length > 0) {
        toast.error("Cannot delete video as it is used in one or more training modules");
        setShowDeleteDialog(false);
        return;
      }

      // Delete the video if not used
      const { error: deleteError } = await supabase
        .from("videos")
        .delete()
        .eq("id", selectedVideo.id);

      if (deleteError) throw deleteError;

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
        <Button onClick={handleOpenAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="truncate">{video.title}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEditDialog(video)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDeleteDialog(video)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {video.description || "No description"}
              </p>
              <p className="text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" /> Duration: {video.duration || "Unknown"}
              </p>
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

      {/* Add Video Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Video</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
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
              />
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 5:30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddVideo}>Add Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
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
              />
            </div>
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
            <div className="grid gap-2">
              <Label htmlFor="edit-duration">Duration</Label>
              <Input
                id="edit-duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateVideo}>Update Video</Button>
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
