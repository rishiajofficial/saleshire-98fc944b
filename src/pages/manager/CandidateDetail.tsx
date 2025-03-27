
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
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

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [candidateStatus, setCandidateStatus] = useState("training");

  // Mock candidate data
  const candidate = {
    id: id,
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    region: "north",
    status: candidateStatus,
    currentStep: 2,
    applyDate: "2023-05-15",
    resume: "robert_johnson_resume.pdf",
    aboutMeVideo: "https://example.com/videos/about-me-video",
    salesPitchVideo: "https://example.com/videos/sales-pitch",
    skills: ["Communication", "Negotiation", "Product Knowledge", "Retail Sales"],
    assessments: [
      {
        id: "a1",
        title: "Initial Screening Assessment",
        score: 85,
        date: "2023-05-16",
        status: "passed",
      },
      {
        id: "a2",
        title: "Product Knowledge Quiz",
        score: 78,
        date: "2023-05-20",
        status: "passed",
      },
      {
        id: "a3",
        title: "Sales Techniques Quiz",
        score: 82,
        date: "2023-05-25",
        status: "passed",
      },
    ],
    trainingProgress: [
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
    ],
    notes: [
      {
        id: "n1",
        text: "Strong communication skills observed during initial screening.",
        author: "Emma Johnson",
        date: "2023-05-17",
      },
      {
        id: "n2",
        text: "Demonstrated excellent product knowledge during training sessions.",
        author: "John Smith",
        date: "2023-05-22",
      },
    ],
    upcomingInterview: {
      id: "i1",
      date: "2023-06-05T10:00:00",
      interviewer: "John Smith",
      type: "Final Interview",
      location: "Online (Zoom)",
    },
  };

  const handleScheduleInterview = (e: React.FormEvent) => {
    e.preventDefault();
    setShowScheduleDialog(false);
    toast.success("Interview scheduled successfully");
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFeedbackDialog(false);
    toast.success("Feedback submitted successfully");
  };

  const handleStatusChange = (newStatus: string) => {
    setCandidateStatus(newStatus);
    toast.success(`Candidate status updated to ${newStatus}`);
  };

  const handleHireCandidate = () => {
    setCandidateStatus("hired");
    toast.success("Candidate has been hired! Congratulations!");
  };

  const handleRejectCandidate = () => {
    setCandidateStatus("rejected");
    toast.success("Candidate has been rejected");
  };

  const handleEmailCandidate = () => {
    window.location.href = `mailto:${candidate.email}`;
  };

  const handleCallCandidate = () => {
    window.location.href = `tel:${candidate.phone}`;
  };

  // Helper function to get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return <Badge variant="secondary">Applied</Badge>;
      case "screening":
        return <Badge variant="secondary">Screening</Badge>;
      case "training":
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Training</Badge>;
      case "sales_task":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Sales Task</Badge>;
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
              {candidate.name}
              <div className="ml-3">{getStatusBadge(candidateStatus)}</div>
            </h1>
            <div className="flex flex-wrap items-center mt-1 text-muted-foreground">
              <div className="flex items-center mr-4">
                <MailIcon className="h-4 w-4 mr-1.5" />
                {candidate.email}
              </div>
              <div className="flex items-center mr-4">
                <Phone className="h-4 w-4 mr-1.5" />
                {candidate.phone}
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                {candidate.location} ({candidate.region} region)
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
                      {candidate.region} region
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Application Date
                    </span>
                    <span className="flex items-center">
                      <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                      {new Date(candidate.applyDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Current Step
                    </span>
                    <span className="flex items-center">
                      <Rocket className="h-4 w-4 mr-2 text-primary" />
                      Step {candidate.currentStep} of 4
                    </span>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Resume
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-fit"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  </div>
                  <div className="border-t pt-4 mt-2">
                    <h4 className="font-medium mb-2">Key Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
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
                        <Button size="sm" variant="outline" className="h-8">
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
                        <Button size="sm" variant="outline" className="h-8">
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
                          <SelectItem value="screening">Screening</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="sales_task">Sales Task</SelectItem>
                          <SelectItem value="interview">Interview</SelectItem>
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
            {candidate.upcomingInterview && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Upcoming Interview</CardTitle>
                  <CardDescription>
                    Details of the scheduled interview
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <CalendarClock className="h-5 w-5 text-yellow-700" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-yellow-900">
                          {candidate.upcomingInterview.type}
                        </h4>
                        <div className="mt-1 text-sm text-yellow-800">
                          <p><strong>Date:</strong> {new Date(candidate.upcomingInterview.date).toLocaleString()}</p>
                          <p><strong>Interviewer:</strong> {candidate.upcomingInterview.interviewer}</p>
                          <p><strong>Location:</strong> {candidate.upcomingInterview.location}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                          <Button size="sm" variant="destructive">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowScheduleDialog(true)}
                    className="w-full"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Schedule Another Interview
                  </Button>
                </CardFooter>
              </Card>
            )}
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
                  {candidate.assessments.map((assessment) => (
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
                            "Failed"
                          )}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            Date: {new Date(assessment.date).toLocaleDateString()}
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
                  ))}
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
                  {candidate.trainingProgress.map((module, index) => (
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
                  {candidate.notes.length > 0 ? (
                    candidate.notes.map((note) => (
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
                <Label htmlFor="interviewDate">Date & Time</Label>
                <Input
                  id="interviewDate"
                  type="datetime-local"
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
    </MainLayout>
  );
};

export default CandidateDetail;
