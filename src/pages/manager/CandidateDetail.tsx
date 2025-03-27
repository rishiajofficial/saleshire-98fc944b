
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Video, 
  BarChart, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  ArrowLeft,
  Edit,
  Calendar as CalendarIcon
} from "lucide-react";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [feedbackText, setFeedbackText] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  
  // Mocked candidate data - in a real app, this would be fetched from an API
  const candidate = {
    id: Number(id),
    name: "Sarah Brown",
    email: "sarah.brown@example.com",
    phone: "+1 (555) 567-8901",
    location: "Boston, MA",
    status: "interview",
    statusText: "Interview",
    applicationDate: "2023-09-10",
    step: 4,
    testScore: 88,
    assessmentScores: [
      { name: "Initial Assessment", score: 78 },
      { name: "Product Knowledge", score: 92 },
      { name: "Sales Techniques", score: 85 },
    ],
    videos: [
      { id: 1, title: "About Me", url: "https://example.com/video1" },
      { id: 2, title: "Sales Pitch", url: "https://example.com/video2" },
    ],
    resume: "sarah_brown_resume.pdf",
    notes: "Strong candidate with previous sales experience. Good communication skills observed in video interviews.",
    interviewScheduled: "2023-10-12T14:00:00",
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return <Badge className="bg-blue-100 text-blue-800">Applied</Badge>;
      case "screening":
        return <Badge className="bg-yellow-100 text-yellow-800">Screening</Badge>;
      case "training":
        return <Badge className="bg-purple-100 text-purple-800">Training</Badge>;
      case "sales_task":
        return <Badge className="bg-orange-100 text-orange-800">Sales Task</Badge>;
      case "interview":
        return <Badge className="bg-green-100 text-green-800">Interview</Badge>;
      case "hired":
        return <Badge variant="success">Hired</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const handleApprove = () => {
    toast.success("Candidate approved successfully");
  };

  const handleReject = () => {
    toast.success("Candidate rejected successfully");
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      toast.error("Please enter feedback");
      return;
    }
    toast.success("Feedback sent successfully");
    setFeedbackText("");
  };

  const handleScheduleInterview = () => {
    if (!interviewDate || !interviewTime) {
      toast.error("Please select a date and time");
      return;
    }
    toast.success("Interview scheduled successfully");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/candidates">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Candidate Profile</h1>
              <div className="flex items-center text-muted-foreground">
                <Link to="/candidates" className="hover:underline">Candidates</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span>{candidate.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject this candidate?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The candidate will be notified of your decision.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReject}>Confirm Rejection</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Approve this candidate?</DialogTitle>
                  <DialogDescription>
                    The candidate will be notified and moved to the next stage.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="approval-note">Add a note (optional)</Label>
                  <Textarea
                    id="approval-note"
                    placeholder="Any additional notes for the candidate..."
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => {}}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleApprove}>
                    Confirm Approval
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Candidate Details</CardTitle>
                <Button variant="outline" size="icon" asChild>
                  <Link to={`/candidates/${id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={candidate.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{candidate.name}</h3>
                  <div className="flex items-center mt-1">
                    {getStatusBadge(candidate.status)}
                    <span className="text-sm text-muted-foreground ml-2">
                      Applied on {new Date(candidate.applicationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{candidate.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{candidate.phone}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{candidate.location}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Resume</p>
                    <Button variant="link" className="h-auto p-0" asChild>
                      <a href="#">Download Resume</a>
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Progress</h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Application Progress</span>
                      <span className="font-medium">
                        Step {candidate.step} of 4
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${(candidate.step / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Score</span>
                      <span className="font-medium">{candidate.testScore}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${candidate.testScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {candidate.interviewScheduled && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Upcoming Interview</h4>
                    <div className="bg-muted rounded-md p-3 flex items-start">
                      <CalendarIcon className="h-5 w-5 text-primary mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {new Date(candidate.interviewScheduled).toLocaleDateString()} at{" "}
                          {new Date(candidate.interviewScheduled).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Final interview with the hiring manager
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Interview
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule an Interview</DialogTitle>
                    <DialogDescription>
                      Select a date and time for the interview with {candidate.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="interview-date">Date</Label>
                      <Input
                        id="interview-date"
                        type="date"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="interview-time">Time</Label>
                      <Input
                        id="interview-time"
                        type="time"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="interview-notes">Notes (Optional)</Label>
                      <Textarea
                        id="interview-notes"
                        placeholder="Any additional information for the interview..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleScheduleInterview}>
                      Schedule Interview
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Feedback to Candidate</DialogTitle>
                    <DialogDescription>
                      Your feedback will be sent to {candidate.name} via email.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="feedback">Feedback Message</Label>
                      <Textarea
                        id="feedback"
                        placeholder="Your feedback for the candidate..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={5}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" onClick={handleSendFeedback}>
                      Send Feedback
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <div className="md:col-span-2">
            <Tabs defaultValue="assessment" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="assessment">Assessment</TabsTrigger>
                <TabsTrigger value="videos">Video Submissions</TabsTrigger>
                <TabsTrigger value="notes">Notes & History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="assessment" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment Scores</CardTitle>
                    <CardDescription>
                      Performance across all assessments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {candidate.assessmentScores.map((assessment, index) => (
                        <div key={index}>
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{assessment.name}</span>
                            <span className="font-medium">{assessment.score}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${assessment.score}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-muted-foreground">
                              {assessment.score < 60 ? "Needs Improvement" : 
                              assessment.score < 80 ? "Satisfactory" : "Excellent"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {assessment.score >= 70 ? "Passing Score" : "Failing Score"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Test Results</CardTitle>
                    <CardDescription>
                      Question-by-question breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Detailed results available</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        View the complete assessment report for {candidate.name}
                      </p>
                      <Button className="mt-4">View Full Report</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="videos" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Submissions</CardTitle>
                    <CardDescription>
                      Review candidate's video presentations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {candidate.videos.map((video) => (
                        <div key={video.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-medium">{video.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Submitted on {new Date(candidate.applicationDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="bg-muted rounded-md aspect-video flex items-center justify-center">
                            <Video className="h-12 w-12 text-muted-foreground" />
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button>
                              <Video className="h-4 w-4 mr-2" />
                              Play Video
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                    <CardDescription>
                      Internal notes about this candidate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4 mb-4">
                      <p className="whitespace-pre-line">{candidate.notes}</p>
                      <div className="text-sm text-muted-foreground mt-2">
                        Added by John Smith on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="new-note">Add a Note</Label>
                      <Textarea
                        id="new-note"
                        placeholder="Add your notes about this candidate..."
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button>Save Note</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Application History</CardTitle>
                    <CardDescription>
                      Timeline of candidate's application process
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="min-w-[32px] flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="w-0.5 h-full bg-muted mx-auto mt-2"></div>
                        </div>
                        <div>
                          <h4 className="font-medium">Interview Scheduled</h4>
                          <p className="text-sm text-muted-foreground">
                            Scheduled for {new Date(candidate.interviewScheduled).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-sm">
                            Final interview scheduled with the hiring manager.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="min-w-[32px] flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="w-0.5 h-full bg-muted mx-auto mt-2"></div>
                        </div>
                        <div>
                          <h4 className="font-medium">Sales Task Completed</h4>
                          <p className="text-sm text-muted-foreground">
                            Sep 25, 2023
                          </p>
                          <p className="mt-1 text-sm">
                            Candidate successfully completed the sales task with a score of 85%.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="min-w-[32px] flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="w-0.5 h-full bg-muted mx-auto mt-2"></div>
                        </div>
                        <div>
                          <h4 className="font-medium">Training Completed</h4>
                          <p className="text-sm text-muted-foreground">
                            Sep 18, 2023
                          </p>
                          <p className="mt-1 text-sm">
                            Completed all required training modules with an average score of 88%.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="min-w-[32px] flex flex-col items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">Application Submitted</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(candidate.applicationDate).toLocaleDateString()}
                          </p>
                          <p className="mt-1 text-sm">
                            Initial application submitted with resume and video introductions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CandidateDetail;
