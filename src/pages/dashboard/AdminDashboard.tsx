
import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  DialogTrigger,
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
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";

const AdminDashboard = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for demonstration
  const stats = {
    totalUsers: 42,
    activeManagers: 5,
    activeCandidates: 24,
    inactiveUsers: 13,
  };

  const users = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "manager",
      status: "active",
      createdAt: "2023-08-15",
      candidatesAssigned: 8,
    },
    {
      id: "2",
      name: "Emma Johnson",
      email: "emma.johnson@example.com",
      role: "manager",
      status: "active",
      createdAt: "2023-07-20",
      candidatesAssigned: 12,
    },
    {
      id: "3",
      name: "Michael Davis",
      email: "michael.davis@example.com",
      role: "manager",
      status: "inactive",
      createdAt: "2023-06-10",
      candidatesAssigned: 0,
    },
    {
      id: "4",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "candidate",
      status: "active",
      createdAt: "2023-09-28",
      candidatesAssigned: null,
    },
    {
      id: "5",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "candidate",
      status: "active",
      createdAt: "2023-09-25",
      candidatesAssigned: null,
    },
    {
      id: "6",
      name: "Lisa Brown",
      email: "lisa.brown@example.com",
      role: "admin",
      status: "active",
      createdAt: "2023-05-10",
      candidatesAssigned: null,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Emma Johnson",
      action: "Created new manager account",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      user: "Admin",
      action: "Assigned 5 candidates to John Smith",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      user: "System",
      action: "Automated account cleanup removed 3 inactive accounts",
      timestamp: "1 day ago",
    },
    {
      id: 4,
      user: "Lisa Brown",
      action: "Updated system settings",
      timestamp: "2 days ago",
    },
  ];

  const handleConfirmDelete = () => {
    if (userToDelete) {
      toast.success(`User account deleted successfully`);
      setShowDeleteDialog(false);
    }
  };

  const initiateDeleteUser = (userId: string, userName: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const handleAddNewUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("New user created successfully");
    // Reset form fields
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  <Input id="name" placeholder="Enter full name" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="email@example.com" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="candidate">
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
                
                <div className="pt-2">
                  <Button type="submit" className="w-full">
                    Create User
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
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 border rounded-lg"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {activity.user === "System" ? (
                        <Settings className="h-5 w-5 text-primary" />
                      ) : activity.user === "Admin" ? (
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
                ))}
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

        {/* Users Management Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, roles, and permissions
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
                            {user.status === "active" ? (
                              <span className="flex items-center">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              "Inactive"
                            )}
                          </Badge>
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
                            >
                              <PenLine className="h-4 w-4" />
                            </Button>
                            {user.role !== "admin" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete User"
                                onClick={() => initiateDeleteUser(user.id, user.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="More Options"
                            >
                              <MoreHorizontal className="h-4 w-4" />
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
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/user-management">
                Advanced User Management
              </Link>
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
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default AdminDashboard;
