import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";
import { CandidateInfo } from "@/components/candidates/CandidateInfo";
import { StatusUpdateSection } from "@/components/candidates/StatusUpdateSection";
import { ManagerAssignment } from "@/components/candidates/ManagerAssignment";
import { InterviewScheduling } from "@/components/candidates/InterviewScheduling";
import { StatusBadge } from "@/components/candidates/StatusBadge";
import { ProjectStatusSection } from "@/components/candidates/ProjectStatusSection";
import { AssessmentResultsSection } from "@/components/candidates/AssessmentResultsSection";
import { updateApplicationStatus, manageInterview } from "@/hooks/useDatabaseQuery";
import { Candidate, AssessmentResult, ManagerProfile } from '@/types/candidate';

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [isAssigningManager, setIsAssigningManager] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  const userRole = profile?.role || '';

  console.log("[CandidateDetail] User object:", user);
  console.log("[CandidateDetail] Profile object:", profile);
  console.log("[CandidateDetail] User role:", userRole);

  const { data: candidateData, isLoading, error: candidateError } = useQuery<Candidate | null>({
    queryKey: ['candidateData', id],
    queryFn: async (): Promise<Candidate | null> => {
      if (!id) return null;
      try {
        const { data, error } = await supabase
          .from('candidates')
          .select(`
            *,
            profile:profiles!candidates_id_fkey(name, email)
          `)
          .eq('id', id)
          .maybeSingle();
  
        if (error) {
          toast({ 
            variant: "destructive", 
            title: "Error fetching candidate", 
            description: error.message 
          });
          console.error("Error fetching candidate:", error);
          return null;
        }

        return data;
      } catch (err) {
        console.error("Error in candidateData queryFn:", err);
        toast({ 
            variant: "destructive", 
            title: "Error fetching candidate", 
            description: err instanceof Error ? err.message : "An unknown error occurred" 
          });
        return null;
      }
    },
    enabled: !!id,
  });
  
  const { data: managers, isLoading: isLoadingManagers } = useQuery<ManagerProfile[]>({
    queryKey: ['managersList'],
    queryFn: async (): Promise<ManagerProfile[]> => {
      console.log("[CandidateDetail] Fetching managers...");
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('role', 'manager');

      if (error) {
        console.error("[CandidateDetail] Error fetching managers:", error.message);
        toast({ 
            variant: "destructive", 
            title: "Error fetching managers", 
            description: error.message 
          });
        return [];
      }
      console.log("[CandidateDetail] Managers fetched:", data);
      // Cast the data to match our ManagerProfile interface
      return (data || []) as ManagerProfile[];
    },
    enabled: !!profile && (profile.role === 'hr' || profile.role === 'admin' || profile.role === 'director' || profile.role === 'authenticated'),
  });

  console.log("[CandidateDetail] Managers data:", managers);

  const [applicationStatus, setApplicationStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingInfo,setIsUpdatingInfo] = useState(false);

  useEffect(() => {
    if (candidateData) {
      setApplicationStatus(candidateData.status || '');
      setCandidate(candidateData);
      setName(candidateData.profile?.name || '');
      setEmail(candidateData.profile?.email || '');
      setPhone(candidateData.phone || '');
      setLocation(candidateData.location || '');
      setRegion(candidateData.region || '');
      setSelectedManager(candidateData.assigned_manager || "");
      console.log("[CandidateDetail] Candidate state set:", candidateData);
    } else {
      setApplicationStatus('');
      setCandidate(null);
      setName('');
      setEmail('');
      setPhone('');
      setLocation('');
      setRegion('');
      setSelectedManager('');
      console.log("[CandidateDetail] Candidate data is null or undefined.");
    }
  }, [candidateData]);

  const handleAssignManager = async () => {
    if (!id || !selectedManager) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Candidate ID or selected manager is missing.",
      });
      return;
    }
    setIsAssigningManager(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ assigned_manager: selectedManager })
        .eq('id', id);

      if (error) throw error;

      setCandidate((prev: any) => ({ ...prev, assigned_manager: selectedManager }));

      toast({
        title: "Success",
        description: "Manager assigned successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error assigning manager",
        description: error.message,
      });
    } finally {
      setIsAssigningManager(false);
    }
  };

  const handleUpdateCandidate = async () => {
    try {
      if (!id) throw new Error("Candidate ID is missing");
      if (!phone) throw new Error("Phone number is missing");
      if (!location) throw new Error("Location is missing");
      if (!region) throw new Error("Region is missing");
      setIsUpdatingInfo(true);
      const { data, error } = await supabase
        .from('candidates')
        .update({
          phone,
          location,
          region
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      const updatedCandidate = { ...candidate,  phone, location, region };
      setCandidate(updatedCandidate);

      toast({
        title: "Success",
        description: "Candidate information updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "error",
        description: `Failed to update candidate: ${error.message}`,
      });
    }
    finally{
      setIsUpdatingInfo(false);
    }
  };

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    setStatusUpdateError(null);
    try {
      if (!id) throw new Error("Candidate ID is missing");
      
      console.log("Attempting to update status to:", applicationStatus);
      const { data, error } = await updateApplicationStatus(id, { status: applicationStatus });
      
      if (error) {
        console.error("Error updating status:", error);
        setStatusUpdateError(error.message);
        throw error;
      }
      if (!data) {
        console.error("No data returned from update");
        setStatusUpdateError("Failed to update status - no data returned");
        throw new Error("Failed to update status");
      }

      const updatedData = { 
        ...candidate, 
        status: applicationStatus,
        current_step: getStepFromStatus(applicationStatus),
        profile: candidate?.profile 
      };
      
      setCandidate(updatedData as any);

      toast({
        title: "Success",
        description: "Application status updated successfully",
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to update application status";
      
      console.error("Status update error:", errorMessage);
      setStatusUpdateError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStepFromStatus = (status?: string): number => {
    if (!status) return 0;
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "applied":
      case "application_in_progress":
        return 1; // Application Step
      case "hr_review":
        return 2; // HR Review Step
      case "hr_approved":
      case "training":
        return 3; // Training/Assessment Step
      case "manager_interview":
        return 4; // Interview Step
      case "paid_project":
        return 5; // Paid Project Step
      case "hired":
        return 6; // Hired Step
      case "rejected":
      case "archived":
        return 7; // Process Ended/Rejected Step
      default:
        return 0;
    }
  };

  const [interviewAction, setInterviewAction] = useState<'create' | 'update' | 'cancel'>('create');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [interviewCandidateId, setInterviewCandidateId] = useState(id || '');
  const [interviewManagerId, setInterviewManagerId] = useState('');
  const [interviewScheduledAt, setInterviewScheduledAt] = useState<Date | undefined>(undefined);
  const [interviewStatus, setInterviewStatus] = useState<'scheduled' | 'confirmed' | 'completed' | 'cancelled'>('scheduled');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isManagingInterview, setIsManagingInterview] = useState(false);

  const [projectStatus, setProjectStatus] = useState<'not_started' | 'assigned' | 'completed_success' | 'rejected' | 'failed'>('not_started');
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);

  const { data: assessmentResults, isLoading: isLoadingResults } = useQuery<AssessmentResult[]>({
    queryKey: ['candidateAssessmentResults', id],
    queryFn: async (): Promise<AssessmentResult[]> => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('assessment_results')
        .select(`
          *,
          assessment:assessment_id(title)
        `)
        .eq('candidate_id', id);
      
      if (error) {
        console.error("Error fetching assessment results:", error.message);
        toast({
          variant: "destructive",
          title: "Error fetching results",
          description: error.message,
        });
        return [];
      }
      // Cast the data to match our AssessmentResult interface
      return (data || []) as AssessmentResult[];
    },
    enabled: !!id,
  });

  console.log("[CandidateDetail] Assessment Results data:", assessmentResults);

  useEffect(() => {
    if (user?.role === 'manager') {
      setInterviewManagerId(user.id || '');
    }
  }, [user]);

  useEffect(() => {
    if (candidate?.status === 'sales_task') {
      setProjectStatus('assigned');
    } else if (candidate?.status === 'hired') {
      setProjectStatus('completed_success');
    } else if (candidate?.status === 'rejected') {
      setProjectStatus('rejected'); 
    } else {
      setProjectStatus('not_started');
    }
  }, [candidate?.status]);

  const handleInterviewManagement = async () => {
    setIsManagingInterview(true);
    try {
      if (!id) throw new Error("Candidate ID is missing");
      if (!interviewScheduledAt) throw new Error("Scheduled date is missing");

      const interviewData = {
        id: interviewId || undefined,
        candidate_id: interviewCandidateId,
        manager_id: interviewManagerId,
        scheduled_at: interviewScheduledAt.toISOString(),
        status: interviewStatus,
        notes: interviewNotes,
        action: interviewAction,
      };

      const { data, error } = await manageInterview(interviewData);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Interview managed successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to manage interview: ${error.message}`,
      });
    } finally {
      setIsManagingInterview(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleAssignProject = async () => {
    setIsUpdatingProject(true);
    try {
      if (!id) throw new Error("Candidate ID is missing");
      const { data, error } = await updateApplicationStatus(id, { status: 'sales_task' });
      if (error) throw error;
      if (!data) throw new Error("Failed to assign project");

      setCandidate((prev: any) => ({ ...prev, status: 'sales_task' }));
      setProjectStatus('assigned');

      toast({
        title: "Success",
        description: "Paid project assigned successfully.",
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign project";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleUpdateProjectOutcome = async (outcome: 'completed_success' | 'rejected' | 'failed') => {
    setIsUpdatingProject(true);
    let finalStatus: string;
    switch (outcome) {
      case 'completed_success':
        finalStatus = 'hired';
        break;
      case 'rejected':
      case 'failed':
      default:
        finalStatus = 'rejected';
        break;
    }

    try {
      if (!id) throw new Error("Candidate ID is missing");
      const { data, error } = await updateApplicationStatus(id, { status: finalStatus });
      if (error) throw error;
      if (!data) throw new Error("Failed to update project outcome");

      setCandidate((prev: any) => ({ ...prev, status: finalStatus }));
      setProjectStatus(outcome);

      toast({
        title: "Success",
        description: "Project outcome updated successfully.",
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update project outcome";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsUpdatingProject(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Candidate Details</h1>
            <p className="text-muted-foreground mt-2">
              Manage candidate application and schedule interviews
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/candidates">
              <ArrowRight className="h-4 w-4 mr-2" /> Back to Candidates
            </Link>
          </Button>
        </div>

        {candidateError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{candidateError.message}</AlertDescription>
          </Alert>
        )}

        {candidate && (
          <>
            <CandidateInfo
              candidate={candidate}
              phone={phone}
              location={location}
              region={region}
              isUpdating={isUpdatingInfo}
              isLoading={isLoading}
              onPhoneChange={setPhone}
              onLocationChange={setLocation}
              onRegionChange={setRegion}
              onUpdateInfo={handleUpdateCandidate}
            />

            <StatusUpdateSection
              applicationStatus={applicationStatus}
              isUpdatingStatus={isUpdatingStatus}
              candidateData={candidateData}
              onStatusChange={setApplicationStatus}
              onStatusUpdate={handleStatusUpdate}
              errorMessage={statusUpdateError || undefined}
            />

            {userRole === 'hr' && (
              <ManagerAssignment
                selectedManager={selectedManager}
                managers={managers}
                isLoadingManagers={isLoadingManagers}
                isAssigningManager={isAssigningManager}
                candidateAssignedManager={candidateData?.assigned_manager}
                onManagerSelect={setSelectedManager}
                onAssignManager={handleAssignManager}
              />
            )}

            {(userRole === 'hr' || userRole === 'admin' || userRole === 'director') && candidate && (
              <InterviewScheduling
                interviewAction={interviewAction}
                interviewManagerId={interviewManagerId}
                interviewScheduledAt={interviewScheduledAt}
                interviewStatus={interviewStatus}
                interviewNotes={interviewNotes}
                isManagingInterview={isManagingInterview}
                managers={managers}
                isLoadingManagers={isLoadingManagers}
                onActionChange={setInterviewAction}
                onManagerChange={setInterviewManagerId}
                onDateChange={setInterviewScheduledAt}
                onStatusChange={setInterviewStatus}
                onNotesChange={setInterviewNotes}
                onSubmit={handleInterviewManagement}
              />
            )}

            {userRole === 'manager' && 
              candidate &&
              (candidate.status === 'hr_approved' || candidate.status === 'training' || candidate.status === 'final_interview' || candidate.status === 'interview') && (
              <InterviewScheduling
                isManager={true}
                interviewAction={interviewAction}
                interviewManagerId={interviewManagerId}
                interviewScheduledAt={interviewScheduledAt}
                interviewStatus={interviewStatus}
                interviewNotes={interviewNotes}
                isManagingInterview={isManagingInterview}
                onActionChange={setInterviewAction}
                onManagerChange={setInterviewManagerId}
                onDateChange={setInterviewScheduledAt}
                onStatusChange={setInterviewStatus}
                onNotesChange={setInterviewNotes}
                onSubmit={handleInterviewManagement}
              />
            )}

            <ProjectStatusSection
              candidate={candidate}
              projectStatus={projectStatus}
              isUpdatingProject={isUpdatingProject}
              onAssignProject={handleAssignProject}
              onUpdateProjectOutcome={handleUpdateProjectOutcome}
            />

            <AssessmentResultsSection
              assessmentResults={assessmentResults}
              isLoadingResults={isLoadingResults}
              formatDate={formatDate}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default CandidateDetail;
