
import React from 'react';
import { Button } from "@/components/ui/button";
import { Video } from '@/types/training';
import { X } from 'lucide-react';

interface VideoItemProps {
  video: Video;
  onDeleteClick: (videoId: string) => void;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, onDeleteClick }) => {
  return (
    <div className="border rounded-md p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => onDeleteClick(video.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      
      {video.thumbnail ? (
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-32 object-cover mb-2 rounded" 
        />
      ) : (
        <div className="w-full h-32 bg-gray-100 flex items-center justify-center mb-2 rounded">
          <span className="text-gray-400">No thumbnail</span>
        </div>
      )}
      
      <h4 className="font-medium truncate">{video.title}</h4>
      <p className="text-sm text-gray-500 truncate">{video.description}</p>
      
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Duration: {video.duration || 'Unknown'}
        </span>
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
  );
};

export default VideoItem;
