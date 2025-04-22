import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Users,
  Search,
  User,
  UserCog,
  Settings,
  AlertCircle,
  ShieldAlert,
  Video,
  FileText,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import useDatabaseQuery from "@/hooks/useDatabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const [deletingAssessmentId, setDeletingAssessmentId] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoadingAssessments, setIsLoadingAssessments] = useState<boolean>(false);

  const { data: fetchedUsers, isLoading: isLoadingUsers } = useDatabaseQuery<any[]>(
    'profiles', 
    { order: ['created_at', { ascending: false }] }
  );

  const { data: fetchedCandidates, isLoading: isLoadingCandidates } = useDatabaseQuery<any[]>(
    'candidates'
  );

  const { data: fetchedManagers, isLoading: isLoadingManagers } = useDatabaseQuery<any[]>(
    'managers'
  );

  const { data: activityLogs, isLoading: isLoadingLogs } = useDatabaseQuery<any[]>(
    'activity_logs',
    { order: ['created_at', { ascending: false }], limit: 10 }
  );

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeManagers: 0,
    activeCandidates: 0,
    inactiveUsers: 0,
  });

  useEffect(() => {
    if (fetchedUsers && fetchedCandidates && fetchedManagers) {
      setStats({
        totalUsers: fetchedUsers.length || 0,
        activeManagers: fetchedManagers.length || 0,
        activeCandidates: fetchedCandidates.length || 0,
        inactiveUsers: 0,
      });
    }
  }, [fetchedUsers, fetchedCandidates, fetchedManagers]);

  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoadingAssessments(true);
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error("Failed to fetch assessments: " + error.message);
        setAssessments([]);
      } else {
        setAssessments(data || []);
      }
      setIsLoadingAssessments(false);
    };
    fetchAssessments();
  }, []);

  const handleDeleteAssessment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) return;
    setDeletingAssessmentId(id);
    const { error } = await supabase.from("assessments").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete assessment: " + error.message);
    } else {
      toast.success("Assessment deleted successfully");
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    }
    setDeletingAssessmentId(null);
  };

  const recentActivity = activityLogs ? activityLogs.slice(0, 4).map(log => {
    const userName = fetchedUsers?.find(u => u.id === log.user_id)?.name || 'Unknown User';
    const timestamp = new Date(log.created_at);
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    let formattedTime;
    if (diffMins < 60) {
      formattedTime = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      formattedTime = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      formattedTime = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    
    return {
      id: log.id,
      user: userName,
      userType: fetchedUsers?.find(u => u.id === log.user_id)?.role || 'system',
      action: log.action,
      type: log.entity_type,
      timestamp: formattedTime
    };
  }) : [];

  const users = fetchedUsers ? fetchedUsers.map(user => {
    const candidateData = fetchedCandidates?.find(c => c.id === user.id);
    const managerData = fetchedManagers?.find(m => m.id === user.id);
    
    return {
      id: user.id,
      name: user.name || 'Unnamed User',
      email: user.email,
      role: user.role,
      status: 'active',
      createdAt: user.created_at,
      ...(user.role === 'candidate' && candidateData ? {
        region: candidateData.region
      } : {}),
      ...(user.role === 'manager' && managerData ? {
        candidatesAssigned: 0,
        regions: ['north']
      } : {})
    };
  }) : [];

  const filteredUsers = users 
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (isLoadingUsers || isLoadingCandidates || isLoadingManagers) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading dashboard data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            User management and system administration
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Manage Assessments</CardTitle>
            <CardDescription>
              Create, edit, or delete active assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAssessments ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : assessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">No assessments found</TableCell>
                    </TableRow>
                  ) : (
                    assessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{assessment.title}</div>
                            <div className="text-xs text-muted-foreground">{assessment.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{assessment.difficulty || "Standard"}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteAssessment(assessment.id)}
                            disabled={deletingAssessmentId === assessment.id}
                            title="Delete assessment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.totalUsers}
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
                    Active Managers
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.activeManagers}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCog className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Candidates
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.activeCandidates}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Inactive Users
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.inactiveUsers}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription>Manage system users</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Create, edit, and manage user accounts. Assign roles and regions.
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/users">
                  <Users className="mr-2 h-4 w-4" /> User Management
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Assessments</CardTitle>
              <CardDescription>Candidate evaluation</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Create and manage assessment content for candidate screening.
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/assessments">
                  <FileText className="mr-2 h-4 w-4" /> Manage Assessments
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Training Management</CardTitle>
              <CardDescription>Training content and quizzes</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Manage training videos and quizzes for the sales training program.
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/training-management">
                  <Video className="mr-2 h-4 w-4" /> Training Content
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recent system and user activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-3 border rounded-lg"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {activity.userType === "system" ? (
                          <Settings className="h-5 w-5 text-primary" />
                        ) : activity.userType === "admin" ? (
                          <ShieldAlert className="h-5 w-5 text-primary" />
                        ) : (
                          <User className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{activity.user}</p>
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent activity to display
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to="/activity-log">
                  View Full Activity Log
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  Recently added users in the system
                </CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8 w-full sm:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No users found matching your search criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.slice(0, 5).map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                            {user.role === "manager" && user.regions && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {user.regions.map((region: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {region}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            {user.role === "candidate" && user.region && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {user.region}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "manager"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                          {user.role === "manager" && user.candidatesAssigned && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {user.candidatesAssigned} candidates assigned
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge
                            variant={user.status === "active" ? "outline" : "secondary"}
                            className={
                              user.status === "active"
                                ? "border-green-500 text-green-600"
                                : "bg-muted text-muted-foreground"
                            }
                          >
                            {user.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <Link to="/users">Manage All Users</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
