import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
} from "lucide-react";

export interface Application {
  id: string;
  job_id: string;
  job_title?: string;
  candidate_id: string;
  candidate_name?: string;
  candidate_email?: string;
  status: string;
  created_at: string;
  updated_at: string;
  assessment_results?: any[];
}

interface ApplicationsListProps {
  applications: Application[];
  isLoading: boolean;
  role: string;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  isLoading,
  role,
}) => {
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    if (expandedApplication === id) {
      setExpandedApplication(null);
    } else {
      setExpandedApplication(id);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
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

  // Get average test score from application's assessment results
  const getApplicationScore = (application: Application) => {
    if (!application.assessment_results || application.assessment_results.length === 0) {
      return "N/A";
    }
    
    const scores = application.assessment_results
      .filter((result: any) => result.score !== null)
      .map((result: any) => result.score);
    
    if (scores.length === 0) return "N/A";
    
    const avgScore = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
    return `${avgScore}%`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>
              {role?.toLowerCase() === 'director'
                ? "All Job Applications"
                : role?.toLowerCase() === 'manager' 
                  ? "Job Applications for Your Positions" 
                  : "Job Applications Awaiting Review"
              }
            </CardTitle>
            <CardDescription>
              {role?.toLowerCase() === 'director'
                ? "View all applications across all jobs."
                : role?.toLowerCase() === 'manager'
                  ? "Review applications assigned to your job postings."
                  : "Review and screen new applications."
              }
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
                <TableHead>Job Position</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Applied Date</TableHead>
                <TableHead className="hidden md:table-cell">Test Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Loading applications...
                  </TableCell>
                </TableRow>
              ) : applications && applications.length > 0 ? (
                applications.slice(0, 5).map((application: Application) => (
                  <React.Fragment key={application.id}>
                    <TableRow>
                      <TableCell>
                        <div className="font-medium">
                          {application.job_title || "Unknown Position"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 mr-2 text-muted-foreground"
                            onClick={() => toggleExpand(application.id)}
                          >
                            {expandedApplication === application.id ? 
                              <ChevronUp className="h-4 w-4" /> : 
                              <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <div>
                            <div className="font-medium">
                              {application.candidate_name || "Unknown Candidate"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {application.candidate_email || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(application.created_at)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getApplicationScore(application)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/applications/${application.id}`}>
                            Review
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expandedApplication === application.id && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={6} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">Application Details</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Applied:</span>
                                  <span>{formatDate(application.created_at)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Test Score:</span>
                                  <span>{getApplicationScore(application)}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-2">Actions</h4>
                              <div className="space-y-2">
                                <Button size="sm" variant="default" className="w-full justify-start" asChild>
                                  <Link to={`/applications/${application.id}`}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    View Application
                                  </Link>
                                </Button>
                                <Button size="sm" variant="outline" className="w-full justify-start" asChild>
                                  <Link to={`/candidates/${application.candidate_id}`}>
                                    <User className="h-4 w-4 mr-2" />
                                    View Candidate
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
                  <TableCell colSpan={6} className="text-center py-4">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationsList;
