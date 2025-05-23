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
  FilePenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import useDatabaseQuery from "@/hooks/useDatabaseQuery";
import { useAuth } from '@/contexts/auth'; // Changed this line
import AdminService from "@/services/adminService";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().optional(),
  role: z.enum(["admin", "manager", "candidate", "hr", "director"]),
  region: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "candidate",
      region: "north",
    },
  });

  const { data: fetchedUsers, isLoading: isLoadingUsers, refetch: refetchUsers } = useDatabaseQuery<any[]>(
    'profiles', 
    { order: ['created_at', { ascending: false }] }
  );

  const { data: fetchedCandidates, isLoading: isLoadingCandidates } = useDatabaseQuery<any[]>(
    'candidates'
  );

  const { data: fetchedManagers, isLoading: isLoadingManagers } = useDatabaseQuery<any[]>(
    'managers'
  );

  useEffect(() => {
    if (userToEdit) {
      loadUserData(userToEdit);
    }
  }, [userToEdit]);

  const loadUserData = async (userId: string) => {
    setIsLoading(true);
    const response = await AdminService.getUser(userId);
    if (response.success && response.data) {
      const userData = response.data;
      form.reset({
        name: userData.name || "",
        email: userData.email || "",
        password: "", // Password is not fetched for security reasons
        role: userData.role || "candidate",
        region: fetchedCandidates?.find(c => c.id === userId)?.region || "north",
      });
    } else {
      toast.error("Failed to load user data");
    }
    setIsLoading(false);
  };

  const users = fetchedUsers ? fetchedUsers.map(user => {
    const candidateData = fetchedCandidates?.find(c => c.id === user.id);
    const managerData = fetchedManagers?.find(m => m.id === user.id);
    
    // Remove any "0" prefix from the role
    const cleanRole = typeof user.role === 'string' ? user.role.replace(/^0/, '') : user.role;
    
    return {
      id: user.id,
      name: user.name || 'Unnamed User',
      email: user.email,
      role: cleanRole,
      status: 'active',
      createdAt: user.created_at,
      ...(cleanRole === 'candidate' && candidateData ? {
        region: candidateData.region
      } : {}),
      ...(cleanRole === 'manager' && managerData ? {
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

  const handleSubmit = async (values: UserFormValues) => {
    setIsLoading(true);
    
    try {
      let response;
      
      if (formMode === 'create') {
        response = await AdminService.createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          region: values.region,
        });
        
        if (response.success) {
          toast.success(`User ${values.name} created successfully with role: ${values.role}`);
          form.reset();
          refetchUsers();
        } else {
          toast.error(`Failed to create user: ${response.error}`);
        }
      } else if (formMode === 'edit' && userToEdit) {
        // Make sure we update the auth email and profile email
        response = await AdminService.updateUser({
          id: userToEdit,
          name: values.name,
          email: values.email,
          role: values.role,
          region: values.region,
          ...(values.password ? { password: values.password } : {})
        });
        
        if (response.success) {
          // Also update the user's email in the auth.users table if email has changed
          const existingUser = users.find(u => u.id === userToEdit);
          if (existingUser && existingUser.email !== values.email) {
            await AdminService.updateUserEmail(userToEdit, values.email);
          }
          
          toast.success(`User ${values.name} updated successfully`);
          setShowEditDialog(false);
          setUserToEdit(null);
          refetchUsers();
        } else {
          toast.error(`Failed to update user: ${response.error}`);
        }
      }
    } catch (error: any) {
      console.error('Error submitting form:', error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const initiateEditUser = (userId: string) => {
    setFormMode('edit');
    setUserToEdit(userId);
    setShowEditDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsLoading(true);
    try {
      const response = await AdminService.deleteUser(userToDelete);
      
      if (response.success) {
        toast.success(`User account deleted successfully`);
        refetchUsers();
      } else {
        toast.error(`Failed to delete user: ${response.error}`);
      }
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      toast.error(`Failed to delete user: ${error.message}`);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await AdminService.updateUserStatus(userId, newStatus);
      if (response.success) {
        toast.success(`User status changed to ${newStatus}`);
        // Update the local state to reflect the change
        refetchUsers();
      } else {
        toast.error(`Failed to update status: ${response.error}`);
      }
    } catch (error: any) {
      console.error('Error updating user status:', error.message);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  // Function to get the color class for a given role
  const getRoleColorClass = (role: string) => {
    switch (role) {
      case 'admin':
        return "bg-purple-100 text-purple-800";
      case 'hr':
        return "bg-yellow-100 text-yellow-800";
      case 'manager':
        return "bg-blue-100 text-blue-800";
      case 'candidate':
        return "bg-green-100 text-green-800";
      case 'director':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder={formMode === 'edit' ? 'Leave empty to keep current password' : 'Enter password'} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="candidate">Candidate</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="director">Director</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region (For Managers & Candidates)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="north">North Region</SelectItem>
                            <SelectItem value="south">South Region</SelectItem>
                            <SelectItem value="east">East Region</SelectItem>
                            <SelectItem value="west">West Region</SelectItem>
                            <SelectItem value="central">Central Region</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating User..." : formMode === 'create' ? "Create User" : "Update User"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

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
                    The system has five types of roles with different permissions:
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
                      <Badge className="bg-yellow-100 text-yellow-800 mr-2">HR</Badge>
                      <span>Access to job management, assessments, and full candidate data</span>
                    </li>
                    <li className="flex items-center">
                      <Badge className="bg-orange-100 text-orange-800 mr-2">Director</Badge>
                      <span>Access to analytics, job management, and oversight of managers</span>
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
                          <Badge className={getRoleColorClass(user.role)}>
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
                              onClick={() => initiateEditUser(user.id)}
                            >
                              <PenLine className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Delete User"
                              onClick={() => {
                                setUserToDelete(user.id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetchUsers()}>
              Refresh Data
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
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

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FilePenLine className="h-5 w-5" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update user details and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Leave empty to keep current password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="candidate">Candidate</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="director">Director</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region (For Managers & Candidates)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="north">North Region</SelectItem>
                          <SelectItem value="south">South Region</SelectItem>
                          <SelectItem value="east">East Region</SelectItem>
                          <SelectItem value="west">West Region</SelectItem>
                          <SelectItem value="central">Central Region</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default UserManagement;
