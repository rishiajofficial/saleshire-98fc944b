
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Clock,
  MoreHorizontal,
  Search,
  Filter,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";

const Candidates = () => {
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const toggleExpand = (id: number) => {
    if (expandedCandidate === id) {
      setExpandedCandidate(null);
    } else {
      setExpandedCandidate(id);
    }
  };

  const deleteCandidate = (id: number) => {
    toast.success("Candidate deleted successfully");
  };

  const scheduleInterview = (id: number) => {
    toast.success("Interview scheduled successfully");
  };

  const candidates = [
    {
      id: 1,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "applied",
      statusText: "Applied",
      applicationDate: "2023-09-28",
      step: 1,
      testScore: 78,
      videos: 2,
      resume: "jane_smith_resume.pdf",
      location: "New York, NY",
      phone: "+1 (555) 123-4567",
    },
    {
      id: 2,
      name: "Michael Johnson",
      email: "michael.johnson@example.com",
      status: "screening",
      statusText: "Screening",
      applicationDate: "2023-09-25",
      step: 1,
      testScore: 82,
      videos: 2,
      resume: "michael_johnson_resume.pdf",
      location: "Chicago, IL",
      phone: "+1 (555) 234-5678",
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily.davis@example.com",
      status: "training",
      statusText: "Training",
      applicationDate: "2023-09-20",
      step: 2,
      testScore: 91,
      videos: 2,
      resume: "emily_davis_resume.pdf",
      location: "Austin, TX",
      phone: "+1 (555) 345-6789",
    },
    {
      id: 4,
      name: "David Wilson",
      email: "david.wilson@example.com",
      status: "sales_task",
      statusText: "Sales Task",
      applicationDate: "2023-09-15",
      step: 3,
      testScore: 85,
      videos: 2,
      resume: "david_wilson_resume.pdf",
      location: "Seattle, WA",
      phone: "+1 (555) 456-7890",
    },
    {
      id: 5,
      name: "Sarah Brown",
      email: "sarah.brown@example.com",
      status: "interview",
      statusText: "Interview",
      applicationDate: "2023-09-10",
      step: 4,
      testScore: 88,
      videos: 2,
      resume: "sarah_brown_resume.pdf",
      location: "Boston, MA",
      phone: "+1 (555) 567-8901",
    },
  ];

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

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus ? candidate.status === filterStatus : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
            <p className="text-muted-foreground mt-2">
              Manage and review candidate applications
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search candidates..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  {filterStatus ? `Filter: ${filterStatus}` : 'Filter'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterStatus("applied")}>
                  Applied
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("screening")}>
                  Screening
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("training")}>
                  Training
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("sales_task")}>
                  Sales Task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("interview")}>
                  Interview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("hired")}>
                  Hired
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("rejected")}>
                  Rejected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Candidates</CardTitle>
            <CardDescription>
              Total: {filteredCandidates.length} candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Applied</TableHead>
                    <TableHead className="hidden md:table-cell">Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((candidate) => (
                      <React.Fragment key={candidate.id}>
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 mr-2 text-muted-foreground"
                                onClick={() => toggleExpand(candidate.id)}
                              >
                                {expandedCandidate === candidate.id ? 
                                  <ChevronUp className="h-4 w-4" /> : 
                                  <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <div>
                                <div className="font-medium">{candidate.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {candidate.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(candidate.status)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(candidate.applicationDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {candidate.testScore}%
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/candidates/${candidate.id}`}>
                                    <Eye className="h-4 w-4 mr-2" /> View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/candidates/${candidate.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => scheduleInterview(candidate.id)}>
                                  <Calendar className="h-4 w-4 mr-2" /> Schedule Interview
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => deleteCandidate(candidate.id)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {expandedCandidate === candidate.id && (
                          <TableRow className="bg-muted/50">
                            <TableCell colSpan={5} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Contact Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Email:</span>
                                      <span>{candidate.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Phone:</span>
                                      <span>{candidate.phone}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Location:</span>
                                      <span>{candidate.location}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Application Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Step:</span>
                                      <span>Step {candidate.step} of 4</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Test Score:</span>
                                      <span>{candidate.testScore}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Videos:</span>
                                      <span>{candidate.videos} submitted</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Actions</h4>
                                  <div className="space-y-2">
                                    <Button size="sm" variant="default" className="w-full justify-start" asChild>
                                      <Link to={`/candidates/${candidate.id}`}>
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Full Profile
                                      </Link>
                                    </Button>
                                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => scheduleInterview(candidate.id)}>
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Schedule Interview
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
                        No candidates found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Candidates;
