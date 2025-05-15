import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { CandidateInfo } from '@/components/candidates/CandidateInfo';
import { StatusUpdateSection } from '@/components/candidates/StatusUpdateSection';
import { ProjectStatusSection } from '@/components/candidates/ProjectStatusSection';
import { AssessmentResultsSection } from '@/components/candidates/AssessmentResultsSection';
import { VideoDisplay } from '@/components/candidates/VideoDisplay';
import { InterviewScheduling } from '@/components/candidates/InterviewScheduling';
import { ManagerAssignment } from '@/components/candidates/ManagerAssignment';
import { CandidateHistoryDialog } from '@/components/candidates/CandidateHistoryDialog';

interface CandidateDetailParams {
  id: string;
}

const CandidateDetail: React.FC = () => {
  const { id } = useParams<CandidateDetailParams>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Replace with actual API endpoint
        const response = await fetch(`/api/candidates/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCandidate(data);
      } catch (e: any) {
        setError(e.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load candidate details.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidate();
  }, [id, toast]);

  if (isLoading) {
    return <div>Loading candidate details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!candidate) {
    return <div>Candidate not found.</div>;
  }

  const handleGoBack = () => {
    navigate('/manager/candidates');
  };

  return (
    <MainLayout>
      <DashboardLayout>
        <div className="container mx-auto mt-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Candidate Details</CardTitle>
            </CardHeader>
            <CardContent>
              <CandidateInfo candidate={candidate} />
            </CardContent>
          </Card>

          <Tabs defaultValue="status" className="w-full">
            <TabsList>
              <TabsTrigger value="status">Status Update</TabsTrigger>
              <TabsTrigger value="project">Project Status</TabsTrigger>
              <TabsTrigger value="assessment">Assessment Results</TabsTrigger>
              <TabsTrigger value="video">Video Display</TabsTrigger>
              <TabsTrigger value="interview">Interview Scheduling</TabsTrigger>
              <TabsTrigger value="manager">Manager Assignment</TabsTrigger>
            </TabsList>
            <TabsContent value="status">
              <StatusUpdateSection candidate={candidate} />
            </TabsContent>
            <TabsContent value="project">
              <ProjectStatusSection candidate={candidate} />
            </TabsContent>
            <TabsContent value="assessment">
              <AssessmentResultsSection candidate={candidate} />
            </TabsContent>
            <TabsContent value="video">
              <VideoDisplay candidate={candidate} />
            </TabsContent>
            <TabsContent value="interview">
              <InterviewScheduling candidate={candidate} />
            </TabsContent>
            <TabsContent value="manager">
              <ManagerAssignment candidate={candidate} />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={handleGoBack}>
              Back to Candidates
            </Button>
            <Button onClick={() => setIsHistoryOpen(true)}>
              View History
            </Button>
          </div>
        </div>
      </DashboardLayout>
      <CandidateHistoryDialog isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} candidateId={id} />
    </MainLayout>
  );
};

export default CandidateDetail;
