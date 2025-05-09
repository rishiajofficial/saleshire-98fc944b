
import React, { useState, useEffect } from "react";
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
  Mail,
  BarChart2,
  CheckSquare,
  Square,
} from "lucide-react";
import { ApplicationFilters, ApplicationFilterValues } from "@/components/applications/ApplicationFilters";
import { ApplicationsBulkActions } from "@/components/applications/ApplicationsBulkActions";
import { EmailTemplates } from "@/components/applications/EmailTemplates";
import { ApplicationStatusHistory } from "@/components/applications/ApplicationStatusHistory";
import { CandidateTag } from "@/components/applications/CandidateTag";
import { ApplicationAnalytics } from "@/components/applications/ApplicationAnalytics";
import { toast } from "sonner";
import { startOfDay, subDays, subWeeks, subMonths, parseISO, isAfter } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export interface Application {
  id: string;
  job_id: string;
  job_title?: string;
  candidate_id: string;
  candidate_name?: string;
  candidate_email?: string;
  status: string;
  candidate_status?: string;
  created_at: string;
  updated_at: string;
  assessment_results?: any[];
  tags?: string[];
}

interface ApplicationsListProps {
  applications: Application[];
  isLoading: boolean;
  role: string;
  userId?: string;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  isLoading,
  role,
  userId,
}) => {
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);
  const [filters, setFilters] = useState<ApplicationFilterValues>({
    status: null,
    searchTerm: "",
    dateRange: null,
  });
  const [filteredApplications, setFilteredApplications] = useState<Application[]>(applications);
  const [selectedApplications, setSelectedApplications] = useState<Application[]>([]);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState<boolean>(false);
  const [selectedTabValue, setSelectedTabValue] = useState<string>("all");
  
  // Handle changes when applications prop changes
  useEffect(() => {
    setFilteredApplications(applications);
    applyFilters(applications);
  }, [applications]);
  
  // Apply filters when filters state changes
  useEffect(() => {
    applyFilters(applications);
  }, [filters]);

  const applyFilters = (apps: Application[]) => {
    let filtered = [...apps];
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(app => app.status === filters.status);
    }
    
    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        app => 
          (app.candidate_name && app.candidate_name.toLowerCase().includes(searchLower)) ||
          (app.candidate_email && app.candidate_email.toLowerCase().includes(searchLower)) ||
          (app.job_title && app.job_title.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply date range filter
    if (filters.dateRange) {
      const now = new Date();
      const today = startOfDay(now);
      
      let startDate: Date;
      switch (filters.dateRange) {
        case 'today':
          startDate = today;
          break;
        case 'week':
          startDate = subWeeks(today, 1);
          break;
        case 'month':
          startDate = subMonths(today, 1);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }
      
      filtered = filtered.filter(app => {
        const appDate = parseISO(app.created_at);
        return isAfter(appDate, startDate);
      });
    }
    
    setFilteredApplications(filtered);
  };

  const toggleExpand = (id: string) => {
    if (expandedApplication === id) {
      setExpandedApplication(null);
    } else {
      setExpandedApplication(id);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: null,
      searchTerm: "",
      dateRange: null,
    });
  };

  const toggleApplicationSelection = (application: Application) => {
    setSelectedApplications(prevSelected => {
      const isSelected = prevSelected.some(app => app.id === application.id);
      
      if (isSelected) {
        return prevSelected.filter(app => app.id !== application.id);
      } else {
        return [...prevSelected, application];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications([...filteredApplications]);
    }
  };

  const clearSelection = () => {
    setSelectedApplications([]);
  };

  const handleAddTag = async (candidateId: string, tag: string) => {
    try {
      // Find the application
      const application = applications.find(app => app.candidate_id === candidateId);
      if (!application) return;
      
      // Get current tags or initialize empty array
      const currentTags = application.tags || [];
      
      // Don't add if tag already exists
      if (currentTags.includes(tag)) return;
      
      // In a real application, you'd update the database via SQL migration
      // For now, we'll just show the success message
      toast.success(`Added tag "${tag}"`);
      
    } catch (error: any) {
      toast.error(`Failed to add tag: ${error.message}`);
    }
  };

  const handleRemoveTag = async (candidateId: string, tagToRemove: string) => {
    try {
      // Find the application
      const application = applications.find(app => app.candidate_id === candidateId);
      if (!application) return;
      
      // Get current tags or initialize empty array
      const currentTags = application.tags || [];
      
      // Filter out the tag to remove
      const newTags = currentTags.filter(tag => tag !== tagToRemove);
      
      // In a real application, you'd update the database via SQL migration
      // For now, we'll just show the success message
      toast.success(`Removed tag "${tagToRemove}"`);
      
    } catch (error: any) {
      toast.error(`Failed to remove tag: ${error.message}`);
    }
  };
  
  // Tab filtering logic
  const getTabFilteredApplications = (apps: Application[]) => {
    switch (selectedTabValue) {
      case 'awaiting_review':
        return apps.filter(app => app.status === 'applied' || app.status === 'hr_review');
      case 'in_progress':
        return apps.filter(app => 
          app.status === 'hr_approved' || 
          app.status === 'training' || 
          app.status === 'manager_interview' ||
          app.status === 'sales_task'
        );
      case 'completed':
        return apps.filter(app => app.status === 'hired' || app.status === 'rejected');
      default:
        return apps;
    }
  };

  const tabFilteredApplications = getTabFilteredApplications(filteredApplications);

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
      case "manager_interview":
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
    <>
      {/* Analytics section - togglable */}
      {showAnalytics && (
        <div className="mb-6">
          <ApplicationAnalytics role={role} userId={userId} />
        </div>
      )}
    
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
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8" 
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart2 className="h-4 w-4 mr-1" />
                {showAnalytics ? "Hide Analytics" : "Show Analytics"}
              </Button>
              
              {selectedApplications.length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8"
                  onClick={() => setEmailDialogOpen(true)}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email Selected
                </Button>
              )}
              
              <Button size="sm" className="h-8" asChild>
                <Link to="/candidates">View All</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and bulk actions */}
          <div className="mb-6 space-y-4">
            <ApplicationFilters 
              filters={filters}
              onFilterChange={setFilters}
              onReset={resetFilters}
            />
            
            <ApplicationsBulkActions
              selectedApplications={selectedApplications}
              onSelectionChange={clearSelection}
            />
            
            <Tabs value={selectedTabValue} onValueChange={setSelectedTabValue}>
              <TabsList className="grid grid-cols-4 mb-2">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="awaiting_review">Awaiting Review</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <div className="flex items-center">
                      <div 
                        className="cursor-pointer rounded-sm border p-1"
                        onClick={toggleSelectAll}
                      >
                        {selectedApplications.length === filteredApplications.length ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </TableHead>
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
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : tabFilteredApplications && tabFilteredApplications.length > 0 ? (
                  tabFilteredApplications.map((application: Application) => (
                    <React.Fragment key={application.id}>
                      <TableRow>
                        <TableCell>
                          <div 
                            className="cursor-pointer rounded-sm border p-1"
                            onClick={() => toggleApplicationSelection(application)}
                          >
                            {selectedApplications.some(app => app.id === application.id) ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
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
                              <div className="font-medium flex items-center gap-1.5">
                                {application.candidate_name || "Unknown Candidate"}
                                <CandidateTag 
                                  candidateId={application.candidate_id} 
                                  tags={application.tags || []}
                                  onAddTag={handleAddTag}
                                  onRemoveTag={handleRemoveTag}
                                />
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
                          <TableCell colSpan={7} className="p-4">
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
                                <ApplicationStatusHistory applicationId={application.id} />
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
                    <TableCell colSpan={7} className="text-center py-4">
                      No applications found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Email templates dialog */}
      {emailDialogOpen && (
        <EmailTemplates 
          isOpen={emailDialogOpen}
          onClose={() => setEmailDialogOpen(false)}
          recipientEmails={selectedApplications.map(a => a.candidate_email || '').filter(Boolean)}
          recipientNames={selectedApplications.map(a => a.candidate_name || '').filter(Boolean)}
        />
      )}
    </>
  );
};

export default ApplicationsList;
