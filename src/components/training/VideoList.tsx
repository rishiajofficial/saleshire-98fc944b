
import React from 'react';
import { Link } from "react-router-dom";
import { Video, Play, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VideoListProps {
  moduleId: string;
  videos: any[];
  watchedVideos: string[];
}

const VideoList = ({ moduleId, videos, watchedVideos }: VideoListProps) => {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center p-12">
        <h2 className="text-2xl font-semibold mb-4">No videos found for this module</h2>
        <p className="text-gray-500 mb-4">There are currently no training videos available for this module.</p>
        <Button asChild>
          <Link to="/training">Return to Training</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {videos.map((video) => {
        const isWatched = watchedVideos.includes(video.id);
        
        return (
          <Card key={video.id} className={isWatched ? "border-green-200" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-5 w-5 mr-2 text-primary" />
                {video.title}
                {isWatched && (
                  <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                )}
              </CardTitle>
              {video.description && (
                <CardDescription>{video.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Duration: {video.duration}
                  {isWatched && <span className="ml-2 text-green-500">Completed</span>}
                </div>
                <Button asChild>
                  <Link to={`/training/video/${moduleId}/${video.id}`}>
                    <Play className="h-4 w-4 mr-2" /> {isWatched ? "Rewatch Video" : "Watch Video"}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VideoList;
