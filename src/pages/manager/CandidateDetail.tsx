
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle,
  ChevronRight,
  Clock,
  Download,
  FileText,
  MailIcon,
  MapPin,
  MessageSquare,
  Phone,
  PlayIcon,
  PlusCircle,
  Rocket,
  ThumbsUp,
  User,
  XCircle,
} from "lucide-react";
import { updateApplicationStatus, manageInterview } from "@/hooks/useDatabaseQuery";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [candidateStatus, setCandidateStatus] = useState("");
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [upcomingInterview, setUpcomingInterview] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (!id) return;
      
      setLoading(true);
      
      try {
        // Fetch the candidate
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select(`
            *,
            profiles:id(name, email)
          `)
          .eq('id', id)
          .single();
          
        if (candidateError) throw candidateError;
        
        // Set candidate state
        setCandidate(candidateData);
        setCandidateStatus(candidateData.status);
        
        // Fetch upcoming interviews
        const { data: interviewData, error: interviewError } = await supabase
          .from('interviews')
          .select(`
            *,
            managers:manager_id(
              profiles:id(name)
            )
          `)
          .eq('candidate_id', id)
          .order('scheduled_at', { ascending: true })
          .limit(1);
          
        if (interviewError) throw interviewError;
        
        if (interviewData && interviewData.length > 0) {
          setUpcomingInterview({
            id: interviewData[0].id,
            date: interviewData[0].scheduled_at,
            status: interviewData[0].status,
            notes: interviewData[0].notes,
            interviewer: interviewData[0].managers?.profiles?.name || 'Not assigned',
            type: 'Interview',
            location: 'Online (Zoom)',
          });
        }
        
        // Fetch assessment results
        const { data: assessmentResults, error: assessmentError } = await supabase
          .from('assessment_results')
          .select(`
            *,
            assessments:assessment_id(title, description)
          `)
          .eq('candidate_id', id)
          .order('completed_at', { ascending: false });
          
        if (assessmentError) throw assessmentError;
        
        if (assessmentResults) {
          setAssessments(assessmentResults.map(result => ({
            id: result.id,
            title: result.assessments?.title || 'Assessment',
            score: result.score || 0,
            date: result.completed_at || result.started_at,
            status: result.completed ? 'passed' : 'in_progress',
          })));
        }
        
        // Fetch notes/feedback
        const { data: notesData, error: notesError } = await supabase
          .from('activity_logs')
          .select(`
            *,
            user:user_id(profiles:id(name))
          `)
          .eq('entity_id', id)
          .eq('entity_type', 'candidate')
          .order('created_at', { ascending: false });
          
        if (notesError) throw notesError;
        
        if (notesData) {
          setNotes(notesData.map(note => ({
            id: note.id,
            text: note.action,
            details: note.details,
            author: note.user?.profiles?.name || 'System',
            date: note.created_at,
          })));
        }
        
        // Mock training progress for now
        setTrainingProgress([
          {
            module: "Product Knowledge",
            progress: 100,
            completed: true,
          },
          {
            module: "Sales Techniques",
            progress: 75,
            completed: false,
          },
          {
            module: "Relationship Building",
            progress: 30,
            completed: false,
          },
        ]);
        
      } catch (error) {
        console.error("Error fetching candidate data:", error);
        toast.error("Failed to load candidate data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCandidateData();
  }, [id]);

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !user?.id || !interviewDate || !interviewTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const scheduledDateTime = `${interviewDate}T${interviewTime}:00`;
      
      const result = await manageInterview({
        candidate_id: id,
        manager_id: user.id,
        scheduled_at: scheduledDateTime,
        notes: interviewNotes,
        action: 'create'
      });
      
      if (result && result.data) {
        toast.success("Interview scheduled successfully");
        setShowScheduleDialog(false);
        
        // Update the UI
        setUpcomingInterview({
          id: result.data[0].id,
          date: scheduledDateTime,
          interviewer: 'You', // This will be the current user
          type: 'Interview',
          location: 'Online (Zoom)',
          status: 'scheduled',
          notes: interviewNotes
        });
        
        // Refresh candidate status if appropriate
        if (['hr_approved', 'training'].includes(candidateStatus)) {
          setCandidateStatus('final_interview');
          await updateApplicationStatus(id, { status: 'final_interview' });
        }
      }
    } catch (error) {
      console.error("Error scheduling interview:", error);
      toast.error("Failed to schedule interview");
    }
  };

  const handleRescheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!upcomingInterview?.id || !interviewDate || !interviewTime) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const scheduledDateTime = `${interviewDate}T${interviewTime}:00`;
      
      const result = await manageInterview({
        id: upcomingInterview.id,
        candidate_id: id!,
        manager_id: user?.id!,
        scheduled_at: scheduledDateTime,
        notes: interviewNotes || upcomingInterview.notes,
        status: 'scheduled',
        action: 'update'
      });
      
      if (result && result.data) {
        toast.success("Interview rescheduled successfully");
        setShowRescheduleDialog(false);
        
        // Update the UI
        setUpcomingInterview({
          ...upcomingInterview,
          date: scheduledDateTime,
          notes: interviewNotes || upcomingInterview.notes
        });
      }
    } catch (error) {
      console.error("Error rescheduling interview:", error);
      toast.error("Failed to reschedule interview");
    }
  };

  const handleCancelInterview = async () => {
    if (!upcomingInterview?.id) {
      toast.error("No interview to cancel");
      return;
    }
    
    try {
      const result = await manageInterview({
        id: upcomingInterview.id,
        candidate_id: id!,
        manager_id: user?.id!,
        scheduled_at: upcomingInterview.date,
        status: 'cancelled',
        action: 'cancel'
      });
      
      if (result && result.data) {
        toast.success("Interview cancelled successfully");
        
        // Update the UI
        setUpcomingInterview({
          ...upcomingInterview,
          status: 'cancelled'
        });
      }
    } catch (error) {
      console.error("Error cancelling interview:", error);
      toast.error("Failed to cancel interview");
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      toast.error("Please enter feedback text");
      return;
    }
    
    try {
      // Save feedback to activity log
      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user?.id,
          action: feedbackText,
          entity_type: 'candidate',
          entity_id: id,
          details: {
            type: 'feedback',
            status: candidateStatus
          }
        });
        
      if (error) throw error;
      
      // Add the new note to the list
      const newNote = {
        id: Date.now().toString(),
        text: feedbackText,
        author: user?.email || 'You',
        date: new Date().toISOString(),
        details: {
          type: 'feedback',
          status: candidateStatus
        }
      };
      
      setNotes([newNote, ...notes]);
      setFeedbackText("");
      setShowFeedbackDialog(false);
      toast.success("Feedback submitted successfully");
      
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateApplicationStatus(id!, { status: newStatus });
      setCandidateStatus(newStatus);
      toast.success(`Candidate status updated to ${newStatus}`);
      
      // Log status change
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user?.id,
          action: `Status changed from ${candidateStatus} to ${newStatus}`,
          entity_type: 'candidate',
          entity_id: id,
          details: {
            type: 'status_change',
            previous: candidateStatus,
            current: newStatus
          }
        });
        
    } catch (error) {
      console.error("Error updating candidate status:", error);
      toast.error("Failed to update candidate status");
    }
  };

  const handleHireCandidate = () => {
    handleStatusChange('hired');
  };

  const handleRejectCandidate = () => {
    handleStatusChange('rejected');
  };

  const handleEmailCandidate = () => {
    if (candidate?.profiles?.email) {
      window.location.href = `mailto:${candidate.profiles.email}`;
    }
  };

  const handleCallCandidate = () => {
    if (candidate?.phone) {
      window.location.href = `tel:${candidate.phone}`;
    }
  };
  
  const openVideo = (videoUrl: string | null, title: string) => {
    if (!videoUrl) {
      toast.error("Video not available");
      return;
    }
    
    setCurrentVideo(videoUrl);
    setVideoTitle(title);
    setShowVideoDialog(true);
  };

  // Helper function to get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return <Badge variant="secondary">Applied</Badge>;
      case "hr_review":
      case "screening":
        return <Badge variant="secondary">HR Review</Badge>;
      case "hr_approved":
      case "training":
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Training</Badge>;
      case "sales_task":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Sales Task</Badge>;
      case "final_interview":
      case "interview":
        return <Badge variant="outline" className="border-purple-500 text-purple-600">Interview</Badge>;
      case "hired":
        return <Badge variant="success">Hired</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading candidate data...</p>
        </div>
      </MainLayout>
    );
  }

  if (!candidate) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <p className="text-lg text-muted-foreground">Candidate not found</p>
          <Button onClick={() => navigate('/candidates')}>Back to Candidates</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              asChild
            >
              <Link to="/candidates">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Candidates
              </Link>
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
              {candidate.profiles?.name || 'Unnamed Candidate'}
              <div className="ml-3">{getStatusBadge(candidateStatus)}</div>
            </h1>
            <div className="flex flex-wrap items-center mt-1 text-muted-foreground">
              <div className="flex items-center mr-4">
                <MailIcon className="h-4 w-4 mr-1.5" />
                {candidate.profiles?.email || 'No email available'}
              </div>
              <div className="flex items-center mr-4">
                <Phone className="h-4 w-4 mr-1.5" />
                {candidate.phone || 'No phone number'}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                {candidate.location || 'Location unknown'} ({candidate.region || 'No region'} region)
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleEmailCandidate}>
              <MailIcon className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button size="sm" variant="outline" onClick={handleCallCandidate}>
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </div>
        </div>

        {/* Tabs navigation */}
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Candidate Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Candidate Information</CardTitle>
                  <CardDescription>
                    Basic information and application details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Region
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {candidate.region || 'Not specified'} region
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Application Date
                    </span>
                    <span className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                      {new Date(candidate.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Current Step
                    </span>
                    <span className="flex items-center">
                      <Rocket className="h-4 w-4 mr-2 text-primary" />
                      Step {candidate.current_step} of 5
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Resume
                    </span>
                    {candidate.resume ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() => window.open(candidate.resume, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">No resume uploaded</span>
                    )}
                  </div>
                  <div className="border-t pt-4 mt-2">
                    <h4 className="font-medium mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills ? (
                        JSON.parse(candidate.skills).map((skill: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No skills listed</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Videos & Status Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Candidate Videos</CardTitle>
                    <CardDescription>
                      Introductory and sales pitch videos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>About Me Video</Label>
                      <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="h-5 w-5 text-muted-foreground mr-2" />
                          <span>Candidate Introduction</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => openVideo(candidate.about_me_video, "About Me Video")}
                          disabled={!candidate.about_me_video}
                        >
                          <PlayIcon className="h-4 w-4 mr-2" /> Watch
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Sales Pitch Video</Label>
                      <div className="bg-secondary rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <MessageSquare className="h-5 w-5 text-muted-foreground mr-2" />
                          <span>Product Sales Pitch</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8"
                          onClick={() => openVideo(candidate.sales_pitch_video, "Sales Pitch Video")}
                          disabled={!candidate.sales_pitch_video}
                        >
                          <PlayIcon className="h-4 w-4 mr-2" /> Watch
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Status Actions</CardTitle>
                    <CardDescription>
                      Manage candidate journey status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Update Status</Label>
                      <Select
                        value={candidateStatus}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="applied">Applied</SelectItem>
                          <SelectItem value="hr_review">HR Review</SelectItem>
                          <SelectItem value="hr_approved">HR Approved</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="sales_task">Sales Task</SelectItem>
                          <SelectItem value="final_interview">Final Interview</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={handleHireCandidate}
                        className="flex-1 bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Hire
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={handleRejectCandidate}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Upcoming Interview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Interview Management</CardTitle>
                <CardDescription>
                  {upcomingInterview && upcomingInterview.status !== 'cancelled' ? 
                    'Manage upcoming interview' : 
                    'Schedule an interview with this candidate'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingInterview && upcomingInterview.status !== 'cancelled' ? (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <CalendarClock className="h-5 w-5 text-yellow-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900">
                          {upcomingInterview.type}
                        </h4>
                        <div className="mt-1 text-sm text-yellow-800">
                          <p><strong>Date:</strong> {new Date(upcomingInterview.date).toLocaleString()}</p>
                          <p><strong>Interviewer:</strong> {upcomingInterview.interviewer}</p>
                          <p><strong>Location:</strong> {upcomingInterview.location}</p>
                          {upcomingInterview.notes && (
                            <p><strong>Notes:</strong> {upcomingInterview.notes}</p>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setInterviewDate(upcomingInterview.date.split('T')[0]);
                            setInterviewTime(upcomingInterview.date.split('T')[1].substring(0, 5));
                            setInterviewNotes(upcomingInterview.notes || '');
                            setShowRescheduleDialog(true);
                          }}>
                            Reschedule
                          </Button>
                          <Button size="sm" variant="destructive" onClick={handleCancelInterview}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center py-4">
                    <Button
                      onClick={() => setShowScheduleDialog(true)}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Results</CardTitle>
                <CardDescription>
                  Performance in various assessment tests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {assessments.length > 0 ? (
                    assessments.map((assessment) => (
                      <div
                        key={assessment.id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-primary mr-2" />
                            <h4 className="font-medium">{assessment.title}</h4>
                          </div>
                          <Badge
                            variant={assessment.status === "passed" ? "outline" : "secondary"}
                            className={
                              assessment.status === "passed"
                                ? "border-green-500 text-green-600"
                                : ""
                            }
                          >
                            {assessment.status === "passed" ? (
                              <span className="flex items-center">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Passed
                              </span>
                            ) : (
                              assessment.status === "in_progress" ? "In Progress" : "Failed"
                            )}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              Date: {assessment.date ? new Date(assessment.date).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="font-medium">
                              Score: {assessment.score}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                assessment.score >= 70
                                  ? "bg-green-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${assessment.score}%` }}
                            ></div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No assessment results available for this candidate.
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Assign New Assessment
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Training Progress</CardTitle>
                <CardDescription>
                  Progress through required training modules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {trainingProgress.map((module, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b bg-muted/50">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium">{module.module}</h4>
                        </div>
                        {module.completed ? (
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-600"
                          >
                            <span className="flex items-center">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Completed
                            </span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-3 w-3" />
                              In Progress
                            </span>
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            Progress: {module.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              module.completed
                                ? "bg-green-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${module.progress}%` }}
                          ></div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            View Module
                          </Button>
                          {!module.completed && (
                            <Button variant="outline" size="sm">
                              Send Reminder
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Candidate Notes</CardTitle>
                    <CardDescription>
                      Feedback and observations about the candidate
                    </CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setShowFeedbackDialog(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{note.author}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(note.date).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm">{note.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No notes available for this candidate.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Interview Dialog */}
      <Dialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>
              Set up an interview with the candidate
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleInterview}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select defaultValue="technical">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial Screening</SelectItem>
                    <SelectItem value="technical">Technical Interview</SelectItem>
                    <SelectItem value="final">Final Interview</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewDate">Date</Label>
                <Input
                  id="interviewDate"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewTime">Time</Label>
                <Input
                  id="interviewTime"
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewLocation">Location</Label>
                <Select defaultValue="online">
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online (Zoom)</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewNotes">Additional Notes</Label>
                <Textarea
                  id="interviewNotes"
                  placeholder="Add any additional information..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Schedule Interview</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reschedule Interview Dialog */}
      <Dialog
        open={showRescheduleDialog}
        onOpenChange={setShowRescheduleDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reschedule Interview</DialogTitle>
            <DialogDescription>
              Update the interview date and time
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRescheduleInterview}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="interviewDate">New Date</Label>
                <Input
                  id="interviewDate"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewTime">New Time</Label>
                <Input
                  id="interviewTime"
                  type="time"
                  value={interviewTime}
                  onChange={(e) => setInterviewTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interviewNotes">Additional Notes</Label>
                <Textarea
                  id="interviewNotes"
                  placeholder="Add any additional information..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRescheduleDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Reschedule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Feedback Dialog */}
      <Dialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Feedback Note</DialogTitle>
            <DialogDescription>
              Record observations and feedback about the candidate
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitFeedback}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="feedbackText">Feedback</Label>
                <Textarea
                  id="feedbackText"
                  placeholder="Enter your feedback..."
                  rows={5}
                  required
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Note</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Video Dialog */}
      <Dialog
        open={showVideoDialog}
        onOpenChange={setShowVideoDialog}
      >
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{videoTitle}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {currentVideo && (
              <iframe
                src={currentVideo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowVideoDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default CandidateDetail;
