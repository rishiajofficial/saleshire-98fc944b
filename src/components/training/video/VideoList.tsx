
import React from 'react';
import { Video } from '@/types/training';
import VideoItem from './VideoItem';
import { Loader2 } from 'lucide-react';

interface VideoListProps {
  videos: Video[];
  loading: boolean;
  onDeleteClick: (videoId: string) => void;
}

const VideoList: React.FC<VideoListProps> = ({ videos, loading, onDeleteClick }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">No videos found</p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoItem 
          key={video.id} 
          video={video} 
          onDeleteClick={onDeleteClick} 
        />
      ))}
    </div>
  );
};

export default VideoList;
