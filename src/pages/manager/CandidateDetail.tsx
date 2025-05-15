
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CandidateInfo } from '@/components/candidates/CandidateInfo';
import { ProjectStatusSection } from '@/components/candidates/ProjectStatusSection';
import { StatusUpdateSection } from '@/components/candidates/StatusUpdateSection';
import { AssessmentResultsSection } from '@/components/candidates/AssessmentResultsSection';
import { CandidateHistoryDialog } from '@/components/candidates/CandidateHistoryDialog';
import { VideoDisplay } from '@/components/candidates/VideoDisplay';
import { InterviewScheduling } from '@/components/candidates/InterviewScheduling';
import { ManagerAssignment } from '@/components/candidates/ManagerAssignment';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';
import { useAuth } from '@/contexts/auth';
import { format } from 'date-fns';

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const { profile } = useAuth();
  
  // State values for CandidateInfo props
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  
  // State values for ProjectStatusSection props
  const [projectStatus, setProjectStatus] = useState<'not_started' | 'assigned' | 'completed_success' | 'rejected' | 'failed'>('not_started');
  const [isUpdatingProject, setIsUpdatingProject] = useState<boolean>(false);
  
  // State values for StatusUpdateSection props
  const [applicationStatus, setApplicationStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  
  // State for ManagerAssignment props
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [managers, setManagers] = useState<{id: string, name: string}[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState<boolean>(false);
  const [isAssigningManager, setIsAssigningManager] = useState<boolean>(false);

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
        
        // Initialize state values from candidate data
        if (data) {
          setPhone(data.phone || '');
          setLocation(data.location || '');
          setRegion(data.region || '');
          setApplicationStatus(data.status || '');
          setProjectStatus((data.project_status || 'not_started') as any);
        }
      } catch (error: any) {
        console.error('Error fetching candidate details:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [id]);

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'MMM dd, yyyy');
  };
  
  // Handlers for CandidateInfo
  const handlePhoneChange = (value: string) => setPhone(value);
  const handleLocationChange = (value: string) => setLocation(value);
  const handleRegionChange = (value: string) => setRegion(value);
  const handleUpdateInfo = async () => {
    // Update candidate info implementation
    setIsUpdating(true);
    // Your update logic here
    setIsUpdating(false);
  };
  
  // Handlers for ProjectStatusSection
  const handleAssignProject = async () => {
    // Assign project implementation
    setIsUpdatingProject(true);
    // Your logic here
    setProjectStatus('assigned');
    setIsUpdatingProject(false);
  };
  
  const handleUpdateProjectOutcome = async (outcome: 'completed_success' | 'rejected' | 'failed') => {
    // Update project outcome implementation
    setIsUpdatingProject(true);
    // Your logic here
    setProjectStatus(outcome);
    setIsUpdatingProject(false);
  };
  
  // Handlers for StatusUpdateSection
  const handleStatusChange = (value: string) => setApplicationStatus(value);
  const handleStatusUpdate = async () => {
    // Status update implementation
    setIsUpdatingStatus(true);
    // Your logic here
    setIsUpdatingStatus(false);
  };
  
  // Handlers for ManagerAssignment
  const handleManagerSelect = (managerId: string) => setSelectedManager(managerId);
  const handleAssignManager = async () => {
    // Manager assignment implementation
    setIsAssigningManager(true);
    // Your logic here
    setIsAssigningManager(false);
  };

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
            <CandidateInfo 
              candidate={candidate}
              phone={phone}
              location={location}
              region={region}
              isUpdating={isUpdating}
              isLoading={loading}
              onPhoneChange={handlePhoneChange}
              onLocationChange={handleLocationChange}
              onRegionChange={handleRegionChange}
              onUpdateInfo={handleUpdateInfo}
            />
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
            <ProjectStatusSection 
              candidate={candidate}
              projectStatus={projectStatus}
              isUpdatingProject={isUpdatingProject}
              onAssignProject={handleAssignProject}
              onUpdateProjectOutcome={handleUpdateProjectOutcome}
            />
            {isUserManager && (
              <StatusUpdateSection 
                applicationStatus={applicationStatus}
                isUpdatingStatus={isUpdatingStatus}
                candidateData={candidate}
                onStatusChange={handleStatusChange}
                onStatusUpdate={handleStatusUpdate}
              />
            )}
          </TabsContent>
          <TabsContent value="assessments">
            <AssessmentResultsSection 
              assessmentResults={candidate.assessments} 
              isLoadingResults={loading}
              formatDate={formatDate}
            />
          </TabsContent>
          <TabsContent value="videos">
            <div className="space-y-4">
              {candidate.videos && candidate.videos.map((video: any) => (
                <VideoDisplay 
                  key={video.id}
                  url={video.url} 
                  title={video.title || "Video"}
                />
              ))}
              {(!candidate.videos || candidate.videos.length === 0) && (
                <p>No videos available</p>
              )}
            </div>
          </TabsContent>
          {isUserManager && (
            <TabsContent value="interviews">
              <InterviewScheduling 
                interviews={candidate.interviews || []}
              />
            </TabsContent>
          )}
          {isUserManager && (
            <TabsContent value="manager">
              <ManagerAssignment 
                selectedManager={selectedManager}
                managers={managers}
                isLoadingManagers={isLoadingManagers}
                isAssigningManager={isAssigningManager}
                candidateAssignedManager={candidate.assigned_manager}
                onManagerSelect={handleManagerSelect}
                onAssignManager={handleAssignManager}
              />
            </TabsContent>
          )}
        </Tabs>

        <CandidateHistoryDialog
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          candidateName={candidate.profile?.name || "Candidate"}
          isLoading={loading}
          logs={[]}
        />
      </div>
    </MainLayout>
  );
};

export default CandidateDetail;
