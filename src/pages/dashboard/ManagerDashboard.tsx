import React, { useState } from "react";
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
  FileText,
  Video,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowUpRight,
  Filter,
  BarChart as BarChartIcon,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

const ManagerDashboard = () => {
  const [expandedCandidate, setExpandedCandidate] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    if (expandedCandidate === id) {
      setExpandedCandidate(null);
    } else {
      setExpandedCandidate(id);
    }
  };

  const dashboardStats = {
    totalCandidates: 24,
    pendingReviews: 5,
    interviewsScheduled: 3,
    averageScore: 76,
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
    },
  ];

  const assessments = [
    {
      id: 1,
      title: "Initial Sales Knowledge",
      type: "Screening",
      questions: 15,
      submissions: 18,
      avgScore: 72,
      lastUpdated: "2023-09-15",
    },
    {
      id: 2,
      title: "Product Knowledge Quiz",
      type: "Training",
      questions: 20,
      submissions: 12,
      avgScore: 84,
      lastUpdated: "2023-09-20",
    },
    {
      id: 3,
      title: "Sales Techniques Assessment",
      type: "Training",
      questions: 25,
      submissions: 10,
      avgScore: 76,
      lastUpdated: "2023-09-22",
    },
  ];

  const upcomingInterviews = [
    {
      id: 1,
      candidateName: "Sarah Brown",
      date: "2023-10-03",
      time: "10:00 AM",
      status: "confirmed",
    },
    {
      id: 2,
      candidateName: "Alex Turner",
      date: "2023-10-05",
      time: "2:30 PM",
      status: "confirmed",
    },
    {
      id: 3,
      candidateName: "Robert Chen",
      date: "2023-10-07",
      time: "11:15 AM",
      status: "pending",
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

  const getInterviewStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-800">
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      default:
        return null;
    }
  };

  const chartData = [
    {
      name: "Application Pass Rate",
      value: 65,
    },
    {
      name: "Training Completion",
      value: 78,
    },
    {
      name: "Sales Task Success",
      value: 45,
    },
    {
      name: "Hire Rate",
      value: 30,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage candidates, assessments, and make hiring decisions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Candidates
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {dashboardStats.totalCandidates}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs flex items-center text-green-600">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>12% from last month</span>
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
                    {dashboardStats.pendingReviews}
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
                    {dashboardStats.interviewsScheduled}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-muted-foreground">
                  Next: Oct 3, 10:00 AM
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Avg. Assessment Score
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {dashboardStats.averageScore}%
                  </h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChartIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-xs flex items-center text-red-600">
                  <ChevronDown className="h-3 w-3 mr-1" />
                  <span>3% from previous assessments</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Funnel Performance</CardTitle>
              <CardDescription>
                Conversion rates at each stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {chartData.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assessments</CardTitle>
                <CardDescription>
                  Recent assessments and quizzes
                </CardDescription>
              </div>
              <Button size="sm" className="h-8" asChild>
                <Link to="/assessments/create">
                  <Plus className="h-4 w-4 mr-1" /> Create
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assessments.map((assessment) => (
                  <div 
                    key={assessment.id}
                    className="border rounded-lg p-3 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{assessment.title}</h4>
                        <div className="flex items-center mt-1">
                          <Badge variant="outline" className="text-xs">
                            {assessment.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-2">
                            {assessment.questions} questions
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-sm">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-muted-foreground mr-1" />
                        <span>{assessment.submissions} submissions</span>
                      </div>
                      <div className="font-medium">
                        Avg: {assessment.avgScore}%
                      </div>
                    </div>
                  </div>
                ))}
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

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>
                Scheduled final interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        {interview.candidateName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{interview.candidateName}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {interview.date} at {interview.time}
                        </div>
                      </div>
                    </div>
                    <div>
                      {getInterviewStatusBadge(interview.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/interviews">
                  Manage Interviews
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Candidates</CardTitle>
                <CardDescription>
                  Manage and review candidate applications
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button size="sm" className="h-8" asChild>
                  <Link to="/candidates">View All</Link>
                </Button>
              </div>
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
                  {candidates.map((candidate) => (
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
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/candidates/${candidate.id}`}>
                              Review
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedCandidate === candidate.id && (
                        <TableRow className="bg-muted/50">
                          <TableCell colSpan={5} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <h4 className="text-sm font-medium mb-2">Video Submissions</h4>
                                <div className="space-y-2 text-sm">
                                  <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Video className="h-4 w-4 mr-2" />
                                    About Me Video
                                  </Button>
                                  <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Video className="h-4 w-4 mr-2" />
                                    Sales Pitch Video
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Actions</h4>
                                <div className="space-y-2">
                                  <Button size="sm" variant="default" className="w-full justify-start">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="outline" className="w-full justify-start">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ManagerDashboard;
