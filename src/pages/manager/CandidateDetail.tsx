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

// Define types for mock data to match expected types
interface MockAssessmentResult {
  id: string;
  score: number;
  completed_at: string;
  assessment: { title: string };
  // Add the missing fields to match AssessmentResult type
  answer_timings: any;
  answers: any;
  assessment_id: string;
  candidate_id: string;
  completed: boolean;
  created_at: string;
  feedback: string;
  reviewed_at: string;
  reviewed_by: string;
  started_at: string;
  updated_at: string;
}

const CandidateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // State for candidate info
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State for status section
  const [applicationStatus, setApplicationStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // State for project section
  const [projectStatus, setProjectStatus] = useState<'not_started' | 'assigned' | 'completed_success' | 'rejected' | 'failed'>('not_started');
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);

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
        // Initialize state values from data
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setRegion(data.region || '');
        setApplicationStatus(data.status || '');
        setProjectStatus(data.project_status || 'not_started');
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

    if (id) {
      fetchCandidate();
    }
  }, [id, toast]);

  const handleGoBack = () => {
    navigate('/manager/candidates');
  };

  // Sample assessment results for testing - extended to match required type
  const mockAssessmentResults: MockAssessmentResult[] = [
    { 
      id: "1", 
      score: 85, 
      completed_at: "2023-05-15T14:30:00Z", 
      assessment: { title: "Sales Assessment" },
      answer_timings: {},
      answers: {},
      assessment_id: "a1",
      candidate_id: "c1",
      completed: true,
      created_at: "2023-05-15T13:30:00Z",
      feedback: "",
      reviewed_at: "",
      reviewed_by: "",
      started_at: "2023-05-15T13:30:00Z",
      updated_at: "2023-05-15T14:30:00Z"
    },
    { 
      id: "2", 
      score: 92, 
      completed_at: "2023-05-10T09:15:00Z", 
      assessment: { title: "Communication Skills" },
      answer_timings: {},
      answers: {},
      assessment_id: "a2",
      candidate_id: "c1",
      completed: true,
      created_at: "2023-05-10T08:15:00Z",
      feedback: "",
      reviewed_at: "",
      reviewed_by: "",
      started_at: "2023-05-10T08:15:00Z",
      updated_at: "2023-05-10T09:15:00Z"
    },
  ];

  // Helper function to format dates
  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  // Handlers for candidate info section
  const handleUpdateCandidateInfo = () => {
    setIsUpdating(true);
    // Implement your update logic here
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Success",
        description: "Candidate information updated.",
      });
    }, 1000);
  };

  // Handlers for status section
  const handleStatusChange = (value: string) => {
    setApplicationStatus(value);
  };

  const handleStatusUpdate = () => {
    setIsUpdatingStatus(true);
    // Implement your update logic here
    setTimeout(() => {
      setIsUpdatingStatus(false);
      toast({
        title: "Success",
        description: "Status updated successfully.",
      });
    }, 1000);
  };

  // Handlers for project section
  const handleAssignProject = () => {
    setIsUpdatingProject(true);
    // Implement your logic here
    setTimeout(() => {
      setProjectStatus('assigned');
      setIsUpdatingProject(false);
      toast({
        title: "Success",
        description: "Project assigned to candidate.",
      });
    }, 1000);
  };

  const handleUpdateProjectOutcome = (outcome: 'completed_success' | 'rejected' | 'failed') => {
    setIsUpdatingProject(true);
    // Implement your logic here
    setTimeout(() => {
      setProjectStatus(outcome);
      setIsUpdatingProject(false);
      toast({
        title: "Success",
        description: `Project marked as ${outcome.replace('_', ' ')}.`,
      });
    }, 1000);
  };

  if (isLoading) {
    return <div>Loading candidate details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!candidate) {
    return <div>Candidate not found.</div>;
  }

  // Sample interviews for testing
  const mockInterviews = [
    {
      id: "1",
      scheduled_at: "2023-06-15T10:00:00Z",
      status: "scheduled",
      notes: "Initial interview with sales manager",
    }
  ];

  // Sample managers for testing
  const mockManagers = [
    { id: "1", name: "John Smith" },
    { id: "2", name: "Jane Doe" },
  ];

  return (
    <MainLayout>
      <DashboardLayout
        children={
          <div className="container mx-auto mt-8">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Candidate Details</CardTitle>
              </CardHeader>
              <CardContent>
                <CandidateInfo 
                  candidate={candidate}
                  phone={phone}
                  location={location}
                  region={region}
                  isUpdating={isUpdating}
                  isLoading={isLoading}
                  onPhoneChange={setPhone}
                  onLocationChange={setLocation}
                  onRegionChange={setRegion}
                  onUpdateInfo={handleUpdateCandidateInfo}
                />
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
                <StatusUpdateSection 
                  applicationStatus={applicationStatus}
                  isUpdatingStatus={isUpdatingStatus}
                  candidateData={candidate}
                  onStatusChange={handleStatusChange}
                  onStatusUpdate={handleStatusUpdate}
                />
              </TabsContent>
              <TabsContent value="project">
                <ProjectStatusSection 
                  candidate={candidate}
                  projectStatus={projectStatus}
                  isUpdatingProject={isUpdatingProject}
                  onAssignProject={handleAssignProject}
                  onUpdateProjectOutcome={handleUpdateProjectOutcome}
                />
              </TabsContent>
              <TabsContent value="assessment">
                <AssessmentResultsSection 
                  assessmentResults={mockAssessmentResults}
                  isLoadingResults={isLoading}
                  formatDate={formatDate}
                />
              </TabsContent>
              <TabsContent value="video">
                <VideoDisplay 
                  url={candidate.about_me_video || ""}
                  title="About Me Video"
                />
              </TabsContent>
              <TabsContent value="interview">
                <InterviewScheduling 
                  interviews={mockInterviews}
                />
              </TabsContent>
              <TabsContent value="manager">
                <ManagerAssignment 
                  selectedManager=""
                  managers={mockManagers}
                  isLoadingManagers={false}
                  isAssigningManager={false}
                  candidateAssignedManager={candidate.assigned_manager}
                  onManagerSelect={() => {}}
                  onAssignManager={() => {}}
                />
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
        }
        sideContent={<div></div>}
      />
      <CandidateHistoryDialog 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        id={id || ""} 
      />
    </MainLayout>
  );
};

export default CandidateDetail;
