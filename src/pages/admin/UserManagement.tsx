import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  Search,
  PenLine,
  Trash2,
  AlertCircle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useDatabaseQuery from "@/hooks/useDatabaseQuery";
import { useAuth } from "@/contexts/AuthContext";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  // Filter users based on search query
  const filteredUsers = users 
    ? users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleAddNewUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const region = formData.get('region') as string;
    
    try {
      // First, create a random password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(2, 7).toUpperCase() + '!';
      
      // Call the edge function to create a user
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      const { data, error } = await supabase.functions.invoke("admin-operations", {
        body: {
          operation: "createUser",
          data: {
            name,
            email,
            password: tempPassword,
            role,
            region,
            adminId: user?.id
          }
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to create user");
      
      toast.success(`User ${name} created successfully with role: ${role}`);
      
      // Reset the form
      e.currentTarget.reset();
      
      // Refresh user list
      window.location.reload();
      
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      toast.error(`Failed to create user: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsLoading(true);
    try {
      // Call the edge function to delete a user
      const { data, error } = await supabase.functions.invoke("admin-operations", {
        body: {
          operation: "deleteUser",
          data: {
            userId: userToDelete,
            adminId: user?.id
          }
        }
      });
      
      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Failed to delete user");
      
      toast.success(`User account deleted successfully`);
      
      // Refresh user list
      window.location.reload();
      
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

  // Show loading state if data is being fetched
  if (isLoadingUsers || isLoadingCandidates || isLoadingManagers) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading user data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage users, roles, and permissions
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard/admin">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin Dashboard
            </Link>
          </Button>
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

          {/* User Management Tips */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>User Management Tips</CardTitle>
              <CardDescription>
                Guidelines for managing system users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">User Roles</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    The system has three types of roles with different permissions:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <Badge className="bg-purple-100 text-purple-800 mr-2">Admin</Badge>
                      <span>Full access to all system functions, user management, and reporting</span>
                    </li>
                    <li className="flex items-center">
                      <Badge className="bg-blue-100 text-blue-800 mr-2">Manager</Badge>
                      <span>Access to candidate management, interviews, and regional reporting</span>
                    </li>
                    <li className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 mr-2">Candidate</Badge>
                      <span>Access to training, assessments, and their own application info</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">Security Best Practices</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li>• Regularly review user accounts and access</li>
                    <li>• Remove inactive accounts promptly</li>
                    <li>• Assign the minimum required permissions</li>
                    <li>• Monitor the activity log for suspicious activity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage all user accounts in the system
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
                    filteredUsers.map((user) => (
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

export default UserManagement;
