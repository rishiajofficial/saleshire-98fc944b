
import React from 'react';
import { Link } from "react-router-dom";
import { Video } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VideoSectionProps {
  videos: any[];
}

const VideoSection = ({ videos }: VideoSectionProps) => {
  React.useEffect(() => {
    console.log("VideoSection rendered with videos:", videos);
  }, [videos]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Video className="h-5 w-5 mr-2 text-blue-500" /> Training Videos
      </h3>
      
      {videos.length === 0 ? (
        <p className="text-gray-500 py-4">No videos available for this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video: any) => (
            <Card key={video.id}>
              <CardHeader>
                <CardTitle className="text-md font-semibold">{video.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {video.description || "No description available."}
                </p>
                <div className="text-xs text-gray-500 mb-4">
                  Duration: {video.duration || 'N/A'}
                </div>
                <Button asChild className="w-full">
                  <Link to={`/training/module/${video.module}/${video.id}`}>
                    Watch Video
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoSection;
