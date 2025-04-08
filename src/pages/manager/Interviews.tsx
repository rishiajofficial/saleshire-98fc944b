
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { ArrowLeft, Plus, Calendar, Video } from "lucide-react";

const Interviews = () => {
  // Placeholder data for interviews
  const interviews = [
    { 
      id: "1", 
      candidateName: "Candidate One", 
      candidateEmail: "candidate1@example.com", 
      scheduledAt: "2025-04-10T10:00:00Z", 
      status: "scheduled" 
    },
    { 
      id: "2", 
      candidateName: "Candidate Two", 
      candidateEmail: "candidate2@example.com", 
      scheduledAt: "2025-04-12T14:00:00Z", 
      status: "confirmed" 
    },
    { 
      id: "3", 
      candidateName: "Candidate Three", 
      candidateEmail: "candidate3@example.com", 
      scheduledAt: "2025-04-06T11:00:00Z", 
      status: "completed" 
    },
  ];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Interviews</h1>
        <div className="flex space-x-4">
          <Button asChild variant="outline">
            <Link to="/dashboard/manager">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Schedule Interview
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Scheduled Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interviews.map((interview) => (
              <TableRow key={interview.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{interview.candidateName}</div>
                    <div className="text-sm text-muted-foreground">
                      {interview.candidateEmail}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(interview.scheduledAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      interview.status === "scheduled"
                        ? "border-blue-500 text-blue-600"
                        : interview.status === "confirmed"
                        ? "border-green-500 text-green-600"
                        : interview.status === "completed"
                        ? "border-purple-500 text-purple-600"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {interview.status !== "completed" && (
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-2" /> Reschedule
                      </Button>
                    )}
                    {interview.status === "confirmed" && (
                      <Button size="sm">
                        <Video className="h-4 w-4 mr-2" /> Join
                      </Button>
                    )}
                    {interview.status === "completed" && (
                      <Button size="sm" variant="outline">
                        View Notes
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </MainLayout>
  );
};

export default Interviews;
