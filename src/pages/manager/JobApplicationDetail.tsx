
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

const JobApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: application, isLoading } = useQuery({
    queryKey: ['job-application', id],
    queryFn: async () => {
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

      return data;
    },
    enabled: !!id
  });

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

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
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.candidate_id && (
                    <CandidateInfo candidateId={application.candidate_id} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assessment">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Results</CardTitle>
                  <CardDescription>Results from tests and assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  {application.candidates?.assessment_results && 
                  application.candidates.assessment_results.length > 0 ? (
                    <div className="space-y-4">
                      {application.candidates.assessment_results.map((result) => (
                        <div key={result.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">
                                {result.assessments?.title || "Assessment"}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={result.completed ? "success" : "outline"}>
                                  {result.completed ? "Completed" : "In Progress"}
                                </Badge>
                                {result.completed_at && (
                                  <span className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(result.completed_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                {result.score !== null ? `${result.score}%` : "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground">Score</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No assessment results available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="status">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Application Status</CardTitle>
                    <CardDescription>Update the status of this application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {application.id && (
                      <StatusUpdateSection 
                        entityId={application.id}
                        entityType="job_application"
                        currentStatus={application.status}
                        candidateId={application.candidate_id}
                      />
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Project Status</CardTitle>
                    <CardDescription>Track candidate's project progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {application.candidate_id && (
                      <ProjectStatusSection candidateId={application.candidate_id} />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobApplicationDetail;
