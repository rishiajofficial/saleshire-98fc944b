
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Edit, Trash2, Video, ExternalLink, ArchiveIcon } from "lucide-react";
import { Video as VideoType } from '@/types/training';
import { formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface VideoListProps {
  videos: VideoType[];
  loading: boolean;
  onDeleteClick: (id: string) => void;
}

const VideoList: React.FC<VideoListProps> = ({ videos, loading, onDeleteClick }) => {
  const [filter, setFilter] = useState<"active" | "archived">("active");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const filteredVideos = videos.filter(video => video.archived === (filter === "archived"));

  const handleArchiveVideo = async (videoId: string, isArchived: boolean) => {
    try {
      const { error } = await supabase
        .from("videos")
        .update({ archived: !isArchived })
        .eq("id", videoId);
        
      if (error) throw error;
      
      toast.success(`Video ${isArchived ? "unarchived" : "archived"} successfully`);
      // Reload the page to refresh the video list
      window.location.reload();
    } catch (error: any) {
      toast.error(`Failed to update video: ${error.message}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <ToggleGroup type="single" value={filter} onValueChange={(value: "active" | "archived") => setFilter(value)}>
          <ToggleGroupItem value="active">Active Videos</ToggleGroupItem>
          <ToggleGroupItem value="archived">Archived Videos</ToggleGroupItem>
        </ToggleGroup>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value: "grid" | "list") => setViewMode(value)}>
          <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
          <ToggleGroupItem value="list">List</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Video className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Module: {video.module}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleArchiveVideo(video.id, !!video.archived)}
                  >
                    <ArchiveIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={video.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClick(video.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-6 text-muted-foreground">
              No {filter} videos found
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Module</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVideos.length > 0 ? (
                filteredVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">{video.title}</TableCell>
                    <TableCell>{formatDuration(video.duration)}</TableCell>
                    <TableCell>{video.module}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleArchiveVideo(video.id, !!video.archived)}
                        >
                          <ArchiveIcon className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteClick(video.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No {filter} videos found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VideoList;
