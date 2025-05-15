import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CandidateInfo from '@/components/candidates/CandidateInfo';
import ProjectStatusSection from '@/components/candidates/ProjectStatusSection';
import StatusUpdateSection from '@/components/candidates/StatusUpdateSection';
import AssessmentResultsSection from '@/components/candidates/AssessmentResultsSection';
import CandidateHistoryDialog from '@/components/candidates/CandidateHistoryDialog';
import VideoDisplay from '@/components/candidates/VideoDisplay';
import InterviewScheduling from '@/components/candidates/InterviewScheduling';
import ManagerAssignment from '@/components/candidates/ManagerAssignment';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/auth';

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            applications:job_applications(*),
            assessments:assessment_results(*),
            interviews:interviews(*),
            videos:candidate_videos(*)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setCandidate(data);
      } catch (error: any) {
        console.error('Error fetching candidate details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 lg:col-span-2" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!candidate) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800">Candidate Not Found</h2>
          <p className="text-gray-600 mt-2">The candidate you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </MainLayout>
    );
  }

  const isUserManager = profile?.role === "manager";

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Candidate Details</h1>
          <Button onClick={() => setShowHistory(true)}>View History</Button>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <CandidateInfo candidate={candidate} />
          </CardContent>
        </Card>

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="status">Status & Projects</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            {isUserManager && <TabsTrigger value="interviews">Interviews</TabsTrigger>}
            {isUserManager && <TabsTrigger value="manager">Manager Assignment</TabsTrigger>}
          </TabsList>
          <TabsContent value="status" className="space-y-4">
            <ProjectStatusSection candidate={candidate} />
            {isUserManager && <StatusUpdateSection candidate={candidate} />}
          </TabsContent>
          <TabsContent value="assessments">
            <AssessmentResultsSection assessments={candidate.assessments} />
          </TabsContent>
          <TabsContent value="videos">
            <VideoDisplay videos={candidate.videos} />
          </TabsContent>
          {isUserManager && (
            <TabsContent value="interviews">
              <InterviewScheduling candidateId={id} interviews={candidate.interviews} />
            </TabsContent>
          )}
          {isUserManager && (
            <TabsContent value="manager">
              <ManagerAssignment candidate={candidate} />
            </TabsContent>
          )}
        </Tabs>

        <CandidateHistoryDialog
          open={showHistory}
          onClose={() => setShowHistory(false)}
          candidateId={id}
        />
      </div>
    </MainLayout>
  );
};

export default CandidateDetail;
