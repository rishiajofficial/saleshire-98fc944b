
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Video, BookOpen } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  duration: string;
  module: string;
}

const ModuleView = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const { data: moduleVideos, isLoading } = useQuery({
    queryKey: ['moduleVideos', moduleId],
    queryFn: async (): Promise<Video[]> => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('module', moduleId)
        .order('created_at');
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: moduleDetails } = useQuery({
    queryKey: ['moduleDetails', moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('module', moduleId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => navigate('/training')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Training
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">{moduleId?.charAt(0).toUpperCase() + moduleId?.slice(1)} Training Module</h1>
          <p className="text-muted-foreground mt-2">
            Complete all videos to unlock the assessment
          </p>
        </div>

        <div className="grid gap-6">
          {moduleVideos?.map((video) => (
            <Card key={video.id}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-5 w-5 mr-2 text-primary" />
                  {video.title}
                </CardTitle>
                {video.description && (
                  <CardDescription>{video.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Duration: {video.duration}
                  </div>
                  <Button asChild>
                    <Link to={`/training/video/${moduleId}/${video.id}`}>
                      <Play className="h-4 w-4 mr-2" /> Watch Video
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {moduleDetails?.quiz_id && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Module Assessment
                </CardTitle>
                <CardDescription>
                  Test your knowledge of this module
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link to={`/training/quiz/${moduleId}`}>
                    Start Assessment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ModuleView;
