import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ExternalLink, User } from "lucide-react";
import { CandidateInfo } from "@/components/candidates/CandidateInfo";
import { ProjectStatusSection } from "@/components/candidates/ProjectStatusSection";
import { StatusBadge } from "@/components/candidates/StatusBadge";
import { StatusUpdateSection } from "@/components/candidates/StatusUpdateSection";
import { AssessmentResultsSection } from "@/components/candidates/AssessmentResultsSection";
import { toast } from "sonner";
import { updateApplicationStatus } from "@/hooks/useDatabaseQuery";
import { JobApplicationCandidate } from "@/types/candidate"; 

const JobApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");

  const { data: application, isLoading, refetch } = useQuery({
    queryKey: ['job-application', id],
    queryFn: async () => {
      if (!id) throw new Error("Application ID is required");

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs (
            id,
            title,
            description,
            department,
            location,
            salary_range,
            employment_type,
            created_at
          ),
          candidates:candidate_id (
            id,
            current_step,
            status,
            resume,
            about_me_video,
            sales_pitch_video,
            phone,
            location,
            region,
            profile:profiles!candidates_id_fkey (
              name,
              email,
              role
            ),
            assessment_results (
              id,
              assessment_id,
              score,
              completed,
              completed_at,
              assessments:assessment_id (
                title
              )
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Initialize state with candidate data
      if (data?.candidates) {
        setPhone(data.candidates.phone || "");
        setLocation(data.candidates.location || "");
        setRegion(data.candidates.region || "");
        setApplicationStatus(data.status || "applied");
      }

      return data;
    },
    enabled: !!id
  });

  const handleUpdateInfo = async () => {
    if (!application?.candidate_id) return;

    setIsUpdating(true);
    try {
      const { data, error } = await supabase
        .from('candidates')
        .update({
          phone,
          location,
          region
        })
        .eq('id', application.candidate_id)
        .select();

      if (error) throw error;
      toast.success("Candidate information updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating info:", error);
      toast.error("Failed to update candidate information");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = (value: string) => {
    setApplicationStatus(value);
  };

  const handleStatusUpdate = async () => {
    if (!application?.candidate_id || !id) return;

    setIsUpdating(true);
    try {
      // Update candidate status
      await updateApplicationStatus(application.candidate_id, {
        status: applicationStatus
      });

      // Update job application status
      const { error } = await supabase
        .from('job_applications')
        .update({ status: applicationStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success("Status updated successfully");
      refetch();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Project status handling
  const [projectStatus, setProjectStatus] = useState<'not_started' | 'assigned' | 'completed_success' | 'rejected' | 'failed'>('not_started');
  const [isUpdatingProject, setIsUpdatingProject] = useState(false);

  const handleAssignProject = async () => {
    if (!application?.candidate_id) return;

    setIsUpdatingProject(true);
    try {
      // Implement your project assignment logic here
      setProjectStatus('assigned');
      toast.success("Project assigned successfully");
    } catch (error) {
      console.error("Error assigning project:", error);
      toast.error("Failed to assign project");
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const handleProjectOutcome = async (outcome: 'completed_success' | 'rejected' | 'failed') => {
    if (!application?.candidate_id) return;

    setIsUpdatingProject(true);
    try {
      // Implement your project outcome update logic here
      setProjectStatus(outcome);
      toast.success(`Project marked as ${outcome.replace('_', ' ')}`);
    } catch (error) {
      console.error("Error updating project outcome:", error);
      toast.error("Failed to update project outcome");
    } finally {
      setIsUpdatingProject(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="flex justify-center">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!application) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-lg font-medium">Application not found</h2>
                <p className="text-muted-foreground mt-2">
                  The job application you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Ensure assessment_results is an array, even if it's an error
  const assessmentResults = application?.candidates?.assessment_results && 
    Array.isArray(application.candidates.assessment_results) 
      ? application.candidates.assessment_results 
      : [];

  // Create a safe candidate object that matches our JobApplicationCandidate type
  const candidateData = application?.candidates ? {
    ...application.candidates,
    // Ensure required fields have default values if missing
    id: application.candidates.id,
    status: application.candidates.status || applicationStatus,
    current_step: application.candidates.current_step || 1,
    assessment_results: assessmentResults,
    // Use empty string as default for optional string fields
    updated_at: application.candidates.updated_at || "",
    assigned_manager: application.candidates.assigned_manager || null
  } : null;

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{application.jobs?.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={application.status} />
                <span className="text-sm text-muted-foreground">
                  Applied on {formatDate(application.created_at)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/candidates/${application.candidate_id}`}>
                  <User className="mr-2 h-4 w-4" />
                  View Candidate Profile
                </Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="candidate">Candidate</TabsTrigger>
              <TabsTrigger value="assessment">Assessment Results</TabsTrigger>
              <TabsTrigger value="status">Status & Actions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Job Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Description</h3>
                        <p className="text-muted-foreground mt-1">{application.jobs?.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-medium">Department</h3>
                          <p className="text-muted-foreground">{application.jobs?.department || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="font-medium">Location</h3>
                          <p className="text-muted-foreground">{application.jobs?.location || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="font-medium">Employment Type</h3>
                          <p className="text-muted-foreground">{application.jobs?.employment_type || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="font-medium">Salary Range</h3>
                          <p className="text-muted-foreground">{application.jobs?.salary_range || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Name</h3>
                        <p>{application.candidates?.profile?.name}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-muted-foreground">{application.candidates?.profile?.email}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Status</h3>
                        <StatusBadge status={application.candidates?.status} />
                      </div>
                      <div>
                        <h3 className="font-medium">Application Progress</h3>
                        <div className="mt-1">
                          <div className="h-2 w-full bg-gray-200 rounded-full">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${application.candidates?.current_step ? Math.min((application.candidates.current_step / 5) * 100, 100) : 20}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Step {application.candidates?.current_step || 1} of 5
                          </div>
                        </div>
                      </div>
                      <div className="pt-4">
                        <Button variant="outline" size="sm" asChild className="w-full">
                          <Link to={`/candidates/${application.candidate_id}`}>
                            View Full Profile
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="candidate">
              {candidateData && (
                <CandidateInfo 
                  candidate={candidateData as any}
                  phone={phone}
                  location={location}
                  region={region}
                  isUpdating={isUpdating}
                  isLoading={isLoading}
                  onPhoneChange={setPhone}
                  onLocationChange={setLocation}
                  onRegionChange={setRegion}
                  onUpdateInfo={handleUpdateInfo}
                />
              )}
            </TabsContent>
            
            <TabsContent value="assessment">
              <AssessmentResultsSection 
                assessmentResults={assessmentResults}
                isLoadingResults={isLoading}
                formatDate={formatDate}
              />
            </TabsContent>
            
            <TabsContent value="status">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatusUpdateSection 
                  applicationStatus={applicationStatus}
                  isUpdatingStatus={isUpdating}
                  candidateData={candidateData}
                  onStatusChange={handleStatusChange}
                  onStatusUpdate={handleStatusUpdate}
                />
                
                {candidateData && (
                  <ProjectStatusSection 
                    candidate={candidateData as any}
                    projectStatus={projectStatus}
                    isUpdatingProject={isUpdatingProject}
                    onAssignProject={handleAssignProject}
                    onUpdateProjectOutcome={handleProjectOutcome}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobApplicationDetail;
