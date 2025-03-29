
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Video,
  FileText,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";

const ManagerDashboard = () => {
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending-reviews");

  const toggleExpand = (id: number) => {
    if (expandedCandidate === id) {
      setExpandedCandidate(null);
    } else {
      setExpandedCandidate(id);
    }
  };

  // Fetch pending candidates that need review
  const { data: pendingCandidates, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['pendingCandidates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select(`
          id,
          profiles:id(name, email),
          status,
          current_step,
          updated_at,
          assessment_results(score)
        `)
        .in('status', ['applied', 'screening', 'training', 'sales_task'])
        .order('updated_at', { ascending: false });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching candidates",
          description: error.message,
        });
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch upcoming interviews
  const { data: upcomingInterviews, isLoading: isLoadingInterviews } = useQuery({
    queryKey: ['upcomingInterviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          id,
          scheduled_at,
          status,
          candidate_id,
          candidates(
            id,
            profiles:id(name, email)
          )
        `)
        .in('status', ['scheduled', 'confirmed'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching interviews",
          description: error.message,
        });
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch recent assessments
  const { data: recentAssessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ['recentAssessments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id,
          title,
          difficulty,
          created_at,
          updated_at,
          assessment_results(count)
        `)
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error fetching assessments",
          description: error.message,
        });
        throw error;
      }
      
      // Get the average scores for each assessment
      const assessmentsWithStats = await Promise.all(data.map(async (assessment) => {
        const { data: resultsData, error: resultsError } = await supabase
          .from('assessment_results')
          .select('score')
          .eq('assessment_id', assessment.id);
        
        if (resultsError) {
          console.error("Error fetching assessment results:", resultsError);
          return {
            ...assessment,
            avgScore: 0,
            submissions: 0
          };
        }
        
        const scores = resultsData.map(r => r.score);
        const avgScore = scores.length > 0 
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
          : 0;
        
        return {
          ...assessment,
          avgScore,
          submissions: scores.length
        };
      }));
      
      return assessmentsWithStats || [];
    }
  });

  // Calculate dashboard stats
  const dashboardStats = {
    totalCandidates: pendingCandidates?.length || 0,
    pendingReviews: pendingCandidates?.filter(c => 
      c.status === 'applied' || c.status === 'screening'
    ).length || 0,
    interviewsScheduled: upcomingInterviews?.length || 0,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Applied
          </Badge>
        );
      case "screening":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" /> Screening
          </Badge>
        );
      case "training":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            Training
          </Badge>
        );
      case "sales_task":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            Sales Task
          </Badge>
        );
      case "interview":
        return (
          <Badge className="bg-green-100 text-green-800">
            Interview
          </Badge>
        );
      case "hired":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" /> Hired
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getInterviewStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800">
            Confirmed
          </Badge>
        );
      case "scheduled":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get average test score from a candidate's assessment results
  const getCandidateScore = (candidate: any) => {
    if (!candidate.assessment_results || candidate.assessment_results.length === 0) {
      return "N/A";
    }
    
    const scores = candidate.assessment_results
      .filter((result: any) => result.score !== null)
      .map((result: any) => result.score);
    
    if (scores.length === 0) return "N/A";
    
    const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    return `${avgScore}%`;
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format datetime for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Focus on your most important tasks: reviewing candidates and upcoming interviews
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Candidates
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {isLoadingCandidates ? "..." : dashboardStats.totalCandidates}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Reviews
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {isLoadingCandidates ? "..." : dashboardStats.pendingReviews}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" asChild>
                  <Link to="/candidates">
                    View pending <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Interviews Scheduled
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {isLoadingInterviews ? "..." : dashboardStats.interviewsScheduled}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                {upcomingInterviews && upcomingInterviews.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Next: {formatDateTime(upcomingInterviews[0].scheduled_at)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="pending-reviews">Pending Reviews</TabsTrigger>
            <TabsTrigger value="upcoming-interviews">Upcoming Interviews</TabsTrigger>
            <TabsTrigger value="recent-assessments">Recent Assessments</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending-reviews">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Candidates Awaiting Review</CardTitle>
                    <CardDescription>
                      Review and approve candidates at different stages
                    </CardDescription>
                  </div>
                  <Button size="sm" className="h-8" asChild>
                    <Link to="/candidates">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Applied</TableHead>
                        <TableHead className="hidden md:table-cell">Test Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingCandidates ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            Loading candidates...
                          </TableCell>
                        </TableRow>
                      ) : pendingCandidates && pendingCandidates.length > 0 ? (
                        pendingCandidates.slice(0, 5).map((candidate: any, index: number) => (
                          <React.Fragment key={candidate.id}>
                            <TableRow>
                              <TableCell>
                                <div className="flex items-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 mr-2 text-muted-foreground"
                                    onClick={() => toggleExpand(index)}
                                  >
                                    {expandedCandidate === index ? 
                                      <ChevronUp className="h-4 w-4" /> : 
                                      <ChevronDown className="h-4 w-4" />}
                                  </Button>
                                  <div>
                                    <div className="font-medium">{candidate.profiles?.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {candidate.profiles?.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(candidate.status)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {formatDate(candidate.updated_at)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {getCandidateScore(candidate)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/candidates/${candidate.id}`}>
                                    Review
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                            {expandedCandidate === index && (
                              <TableRow className="bg-muted/50">
                                <TableCell colSpan={5} className="p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Application Details</h4>
                                      <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Step:</span>
                                          <span>Step {candidate.current_step} of 4</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-muted-foreground">Test Score:</span>
                                          <span>{getCandidateScore(candidate)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Actions</h4>
                                      <div className="space-y-2">
                                        <Button size="sm" variant="default" className="w-full justify-start" asChild>
                                          <Link to={`/candidates/${candidate.id}`}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                          </Link>
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                                          <Link to={`/candidates/${candidate.id}`}>
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </Link>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No candidates pending review
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming-interviews">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
                <CardDescription>
                  Scheduled interviews with candidates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingInterviews ? (
                    <div className="text-center py-4">Loading interviews...</div>
                  ) : upcomingInterviews && upcomingInterviews.length > 0 ? (
                    upcomingInterviews.map((interview: any) => (
                      <div
                        key={interview.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {interview.candidates?.profiles?.name ? 
                              interview.candidates.profiles.name.split(' ').map((n: string) => n[0]).join('') : 
                              <User className="h-5 w-5" />
                            }
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{interview.candidates?.profiles?.name || "Candidate"}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDateTime(interview.scheduled_at)}
                            </div>
                          </div>
                        </div>
                        <div>
                          {getInterviewStatusBadge(interview.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">No upcoming interviews</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link to="/candidates">
                    Manage Interviews
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent-assessments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Assessments</CardTitle>
                  <CardDescription>
                    Recently updated assessments and quizzes
                  </CardDescription>
                </div>
                <Button size="sm" className="h-8" asChild>
                  <Link to="/assessments">
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingAssessments ? (
                    <div className="text-center py-4">Loading assessments...</div>
                  ) : recentAssessments && recentAssessments.length > 0 ? (
                    recentAssessments.map((assessment: any) => (
                      <div 
                        key={assessment.id}
                        className="border rounded-lg p-3 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{assessment.title}</h4>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="text-xs">
                                {assessment.difficulty || "Standard"}
                              </Badge>
                              <span className="text-xs text-muted-foreground ml-2">
                                Updated: {formatDate(assessment.updated_at)}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
                            <Link to={`/assessments/${assessment.id}`}>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-muted-foreground mr-1" />
                            <span>{assessment.submissions || 0} submissions</span>
                          </div>
                          <div className="font-medium">
                            Avg: {assessment.avgScore || 0}%
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">No assessments found</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full" asChild>
                  <Link to="/assessments">
                    View All Assessments
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ManagerDashboard;
