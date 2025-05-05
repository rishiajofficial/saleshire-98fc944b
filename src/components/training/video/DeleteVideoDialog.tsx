
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeleteVideoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  videoId: string | null;
}

const DeleteVideoDialog: React.FC<DeleteVideoDialogProps> = ({ 
  open, 
  onOpenChange, 
  onConfirmDelete,
  videoId
}) => {
  const handleDelete = async () => {
    if (!videoId) return;
    
    try {
      console.log(`Starting video deletion process for video ID: ${videoId}`);
      
      // Step 1: Delete training_progress entries first
      console.log("Deleting training_progress entries");
      const { error: deleteProgressError } = await supabase
        .from('training_progress')
        .delete()
        .eq('video_id', videoId);
          
      if (deleteProgressError) {
        console.error('Error deleting related progress entries:', deleteProgressError);
        toast.error(`Failed to delete related progress: ${deleteProgressError.message}`);
        return;
      }
      console.log("Successfully deleted training_progress entries");
      
      // Step 2: Delete category_videos relationships
      console.log("Deleting category_videos entries");
      const { error: categoryVideosError } = await supabase
        .from('category_videos')
        .delete()
        .eq('video_id', videoId);
        
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
        .eq('video_id', videoId);
        
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
        .eq('id', videoId);
        
      if (error) {
        console.error('Error deleting video:', error);
        toast.error(`Failed to delete video: ${error.message}`);
        return;
      }
      
      console.log("Video successfully deleted");
      toast.success('Video deleted successfully');
      onConfirmDelete();
    } catch (error: any) {
      console.error('Error in deletion process:', error);
      toast.error(`Failed to delete video: ${error.message}`);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete this video? This will also remove all training 
          progress related to this video.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteVideoDialog;
