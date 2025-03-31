import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { CalendarRange } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  FileText,
  Video,
  Phone,
  MapPin,
  Mail,
} from "lucide-react";
import useDatabaseQuery from "@/hooks/useDatabaseQuery";
import { updateApplicationStatus, manageInterview } from "@/hooks/useDatabaseQuery";
import { UserRole } from "@/types";

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  // Fetch candidate data
  useEffect(() => {
    const fetchCandidate = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await useDatabaseQuery('candidates', {
          eq: ['id', id],
          single: true
        });
        if (error) throw error;
        setCandidate(data);
      } catch (error: any) {
        setError(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to fetch candidate: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidate();
  }, [id, toast]);

  // State for application status update
  const [applicationStatus, setApplicationStatus] = useState(candidate?.status || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Update application status
  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    try {
      if (!id) throw new Error("Candidate ID is missing");
      const { data, error } = await updateApplicationStatus(id, { status: applicationStatus });
      if (error) throw error;

      // Optimistically update the candidate state
      setCandidate(prevCandidate => ({ ...prevCandidate, status: applicationStatus }));

      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update application status: ${error.message}`,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // State for interview management
  const [interviewAction, setInterviewAction] = useState<'create' | 'update' | 'cancel'>('create');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [interviewCandidateId, setInterviewCandidateId] = useState(id || '');
  const [interviewManagerId, setInterviewManagerId] = useState('');
  const [interviewScheduledAt, setInterviewScheduledAt] = useState<Date | undefined>(undefined);
  const [interviewStatus, setInterviewStatus] = useState<'scheduled' | 'confirmed' | 'completed' | 'cancelled'>('scheduled');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isManagingInterview, setIsManagingInterview] = useState(false);

  // Manage interview
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

  // Get status badge component based on status string
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            Applied
          </Badge>
        );
      case "screening":
      case "hr_review":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" /> Screening
          </Badge>
        );
      case "hr_approved":
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
      case "final_interview":
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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading candidate details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!candidate) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Candidate not found.</p>
        </div>
      </MainLayout>
    );
  }

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

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Details about the candidate's application
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input type="text" value={candidate.profiles?.name || 'No name available'} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={candidate.profiles?.email} readOnly />
              </div>
              <div>
                <Label>Phone</Label>
                <Input type="tel" value={candidate.phone || 'N/A'} readOnly />
              </div>
              <div>
                <Label>Location</Label>
                <Input type="text" value={candidate.location || 'N/A'} readOnly />
              </div>
              <div>
                <Label>Region</Label>
                <Input type="text" value={candidate.region || 'N/A'} readOnly />
              </div>
              <div>
                <Label>Application Date</Label>
                <Input type="text" value={formatDate(candidate.updated_at)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>
              Update the candidate's application status
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Status</Label>
                <Select value={applicationStatus} onValueChange={setApplicationStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="applied">Applied</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="hr_review">HR Review</SelectItem>
                    <SelectItem value="hr_approved">HR Approved</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="sales_task">Sales Task</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="final_interview">Final Interview</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                </Button>
              </div>
              <div>
                {getStatusBadge(candidate.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Interview</CardTitle>
            <CardDescription>
              Schedule or update an interview for the candidate
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Action</Label>
                <Select value={interviewAction} onValueChange={setInterviewAction}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="cancel">Cancel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Manager ID</Label>
                <Input type="text" value={interviewManagerId} onChange={(e) => setInterviewManagerId(e.target.value)} />
              </div>
              <div>
                <Label>Scheduled At</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !interviewScheduledAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarRange className="mr-2 h-4 w-4" />
                      {interviewScheduledAt ? (
                        format(interviewScheduledAt, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={interviewScheduledAt}
                      onSelect={setInterviewScheduledAt}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={interviewStatus} onValueChange={setInterviewStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={interviewNotes} onChange={(e) => setInterviewNotes(e.target.value)} />
              </div>
              <div>
                <Button onClick={handleInterviewManagement} disabled={isManagingInterview}>
                  {isManagingInterview ? "Managing..." : "Manage Interview"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CandidateDetail;
