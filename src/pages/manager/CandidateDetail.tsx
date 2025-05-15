
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CandidateInfo } from '/dev-server/src/components/candidates/CandidateInfo';
import { ProjectStatusSection } from '/dev-server/src/components/candidates/ProjectStatusSection';
import { StatusUpdateSection } from '/dev-server/src/components/candidates/StatusUpdateSection';
import { AssessmentResultsSection } from '/dev-server/src/components/candidates/AssessmentResultsSection';
import { CandidateHistoryDialog } from '/dev-server/src/components/candidates/CandidateHistoryDialog';
import { VideoDisplay } from '/dev-server/src/components/candidates/VideoDisplay';
import { InterviewScheduling } from '/dev-server/src/components/candidates/InterviewScheduling';
import { ManagerAssignment } from '/dev-server/src/components/candidates/ManagerAssignment';

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
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
            interviews:interview_schedules(*),
            videos:candidate_videos(*)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        setCandidate(data);
      } catch (error) {
        console.error('Error fetching candidate:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidate();
  }, [id]);
  
  if (loading || !candidate) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Mock data for demonstration purposes to satisfy prop requirements
  const mockCandidateData = {
    ...candidate,
    phone: candidate.phone || '555-123-4567',
    location: candidate.location || 'Unknown Location',
    region: candidate.region || 'Unknown Region',
    status: candidate.status || 'Active',
    project_status: candidate.project_status || 'Not Assigned'
  };

  const mockProjectData = {
    projectStatus: mockCandidateData.project_status,
    isUpdatingProject: false,
    onAssignProject: () => console.log('Assign project'),
    onUpdateProjectOutcome: () => console.log('Update project outcome')
  };

  const mockStatusData = {
    status: mockCandidateData.status,
    isUpdating: false,
    onUpdateStatus: () => console.log('Update status')
  };

  const mockAssessmentData = {
    results: candidate.assessments || [],
    isLoading: false
  };

  const mockInterviewData = {
    upcoming: candidate.interviews || [],
    past: [],
    isLoading: false,
    onSchedule: () => console.log('Schedule interview')
  };

  const mockVideoData = {
    videoList: candidate.videos || [],
    isLoading: false
  };

  const mockManagerData = {
    currentManager: candidate.manager || null,
    isUpdating: false,
    onAssign: () => console.log('Assign manager')
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">{candidate.name}</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setHistoryOpen(true)}>
              View History
            </Button>
            <Button>Contact</Button>
          </div>
        </div>
        
        <CandidateInfo 
          email={mockCandidateData.email}
          phone={mockCandidateData.phone}
          location={mockCandidateData.location}
          region={mockCandidateData.region}
          status={mockCandidateData.status}
          projectStatus={mockCandidateData.project_status}
          isUpdating={false}
          resumeUrl={candidate.resume_url}
          linkedInUrl={candidate.linkedin_url}
          githubUrl={candidate.github_url}
          portfolioUrl={candidate.portfolio_url}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="interviews">Interviews</TabsTrigger>
            <TabsTrigger value="management" className="hidden lg:block">Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 pt-6">
            <ProjectStatusSection {...mockProjectData} />
            <Separator />
            <StatusUpdateSection {...mockStatusData} />
          </TabsContent>
          
          <TabsContent value="assessments" className="space-y-6 pt-6">
            <AssessmentResultsSection {...mockAssessmentData} />
          </TabsContent>
          
          <TabsContent value="videos" className="space-y-6 pt-6">
            <VideoDisplay {...mockVideoData} />
          </TabsContent>
          
          <TabsContent value="interviews" className="space-y-6 pt-6">
            <InterviewScheduling 
              candidateId={id || ''}
              interviews={mockInterviewData}
            />
          </TabsContent>
          
          <TabsContent value="management" className="space-y-6 pt-6">
            <ManagerAssignment {...mockManagerData} />
          </TabsContent>
        </Tabs>
      </div>
      
      <CandidateHistoryDialog 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)} 
        candidateId={id || ''}
      />
    </DashboardLayout>
  );
};

export default CandidateDetail;
