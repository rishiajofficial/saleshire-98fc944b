
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserPlus,
  Search,
  MoreHorizontal,
  User,
  UserCog,
  Settings,
  PenLine,
  Trash2,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  Video,
  FileText,
  Plus,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import useDatabaseQuery, { TableName } from "@/hooks/useDatabaseQuery";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const navigate = useNavigate();

  // Fetch users from database
  const { data: fetchedUsers, isLoading: isLoadingUsers } = useDatabaseQuery<any[]>(
    'profiles', 
    { order: ['created_at', { ascending: false }] }
  );

  // Fetch candidate data
  const { data: fetchedCandidates, isLoading: isLoadingCandidates } = useDatabaseQuery<any[]>(
    'candidates'
  );

  // Fetch manager data
  const { data: fetchedManagers, isLoading: isLoadingManagers } = useDatabaseQuery<any[]>(
    'managers'
  );

  // Fetch activity logs
  const { data: activityLogs, isLoading: isLoadingLogs } = useDatabaseQuery<any[]>(
    'activity_logs',
    { order: ['created_at', { ascending: false }], limit: 10 }
  );

  // Calculate stats based on real data
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
        inactiveUsers: 0, // We don't have an 'active' flag in the profile table yet, so default to 0
      });
    }
  }, [fetchedUsers, fetchedCandidates, fetchedManagers]);

  // Process activity logs for display
  const recentActivity = activityLogs ? activityLogs.slice(0, 4).map(log => {
    // Try to find user name by ID
    const userName = fetchedUsers?.find(u => u.id === log.user_id)?.name || 'Unknown User';
    
    // Format the timestamp
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

  // Process users for display
  const users = fetchedUsers ? fetchedUsers.map(user => {
    // Find additional data for candidates and managers
    const candidateData = fetchedCandidates?.find(c => c.id === user.id);
    const managerData = fetchedManagers?.find(m => m.id === user.id);
    
    return {
      id: user.id,
      name: user.name || 'Unnamed User',
      email: user.email,
      role: user.role,
      status: 'active', // Default to active since we don't have this field yet
      createdAt: user.created_at,
      // Add role-specific data
      ...(user.role === 'candidate' && candidateData ? {
        region: candidateData.region
      } : {}),
      ...(user.role === 'manager' && managerData ? {
        // We'll need to fetch this data differently, but for now:
        candidatesAssigned: 0,
        regions: ['north'] // Placeholder
      } : {})
    };
  }) : [];

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsLoading(true);
    try {
      // Delete user profile (should cascade to their role-specific record)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete);
      
      if (error) throw error;
      
      toast.success(`User account deleted successfully`);
      
      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: 'Deleted user account',
        entity_type: 'user',
        entity_id: userToDelete,
      });
      
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const initiateDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleAddNewUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const region = formData.get('region') as string;
    
    try {
      // First, create the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'Password123', // Default password that user will reset
        email_confirm: true,
        user_metadata: {
          name,
          role,
          region
        }
      });
      
      if (authError) throw authError;
      
      toast.success(`User ${name} created successfully with role: ${role}`);
      
      // Log the activity
      await supabase.from('activity_logs').insert({
        user_id: user?.id,
        action: `Created new user account: ${name} (${role})`,
        entity_type: 'user',
        entity_id: authData.user.id,
      });
      
      // Reset the form
      e.currentTarget.reset();
      
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      toast.error(`Failed to create user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    // This is a placeholder - we don't currently have a status field in the profiles table
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      toast.success(`User status changed to ${newStatus}`);
      // We would update the database here if we had the status field
    } catch (error: any) {
      console.error('Error updating user status:', error.message);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  // Filter users based on search query
  const filteredUsers = users 
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Show loading state if data is being fetched
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

        {/* Dashboard Stats */}
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

        {/* Quick Access Cards */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add New User */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" /> Add New User
              </CardTitle>
              <CardDescription>
                Create new user accounts with role assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddNewUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" placeholder="Enter full name" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" name="email" type="email" placeholder="email@example.com" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue="candidate">
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="candidate">Candidate</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2" id="regions-select">
                  <Label htmlFor="region">Region (For Managers & Candidates)</Label>
                  <Select name="region" defaultValue="north">
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="north">North Region</SelectItem>
                      <SelectItem value="south">South Region</SelectItem>
                      <SelectItem value="east">East Region</SelectItem>
                      <SelectItem value="west">West Region</SelectItem>
                      <SelectItem value="central">Central Region</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    You can select multiple regions after creating the user
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating User..." : "Create User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
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

        {/* Users Table */}
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={
                              user.status === "active"
                                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                : "text-red-600 hover:text-red-700 hover:bg-red-50"
                            }
                            onClick={() => handleToggleUserStatus(user.id, user.status)}
                          >
                            <Badge
                              variant={user.status === "active" ? "outline" : "secondary"}
                              className={
                                user.status === "active"
                                  ? "border-green-500 text-green-600"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {user.status === "active" ? (
                                <span className="flex items-center">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Active
                                </span>
                              ) : (
                                "Inactive"
                              )}
                            </Badge>
                          </Button>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Edit User"
                              onClick={() => navigate(`/users/edit/${user.id}`)}
                            >
                              <PenLine className="h-4 w-4" />
                            </Button>
                            {user.role !== "admin" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete User"
                                onClick={() => initiateDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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
              <Link to="/users">View All Users</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Deleting this user will remove all their data from the system, including application history and assessment results.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminDashboard;
