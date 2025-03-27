
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

const AdminDashboard = () => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");

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
      regions: ["north", "east"]
    },
    {
      id: "2",
      name: "Emma Johnson",
      email: "emma.johnson@example.com",
      role: "manager",
      status: "active",
      createdAt: "2023-07-20",
      candidatesAssigned: 12,
      regions: ["south", "west"]
    },
    {
      id: "3",
      name: "Michael Davis",
      email: "michael.davis@example.com",
      role: "manager",
      status: "inactive",
      createdAt: "2023-06-10",
      candidatesAssigned: 0,
      regions: ["central"]
    },
    {
      id: "4",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "candidate",
      status: "active",
      createdAt: "2023-09-28",
      region: "north"
    },
    {
      id: "5",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "candidate",
      status: "active",
      createdAt: "2023-09-25",
      region: "south"
    },
    {
      id: "6",
      name: "Lisa Brown",
      email: "lisa.brown@example.com",
      role: "admin",
      status: "active",
      createdAt: "2023-05-10"
    },
  ];

  const trainingVideos = [
    {
      id: "1",
      title: "Product Knowledge: Security Locks Overview",
      description: "Introduction to our security lock products, features and benefits",
      module: "product",
      url: "https://example.com/videos/product-locks",
      duration: "12:34",
      createdAt: "2023-07-15"
    },
    {
      id: "2",
      title: "Sales Techniques: Handling Objections",
      description: "Learn how to effectively handle common customer objections",
      module: "sales",
      url: "https://example.com/videos/sales-objections",
      duration: "15:21",
      createdAt: "2023-08-10"
    },
    {
      id: "3",
      title: "Relationship Building: Retailer Partnerships",
      description: "Strategies for building long-term relationships with retailers",
      module: "relationship",
      url: "https://example.com/videos/retailer-relationships",
      duration: "08:45",
      createdAt: "2023-09-05"
    },
  ];

  const quizzes = [
    {
      id: "1",
      title: "Product Knowledge Assessment",
      description: "Test understanding of our security lock products",
      module: "product",
      questionCount: 10,
      passingScore: 70,
      createdAt: "2023-07-20"
    },
    {
      id: "2",
      title: "Sales Techniques Quiz",
      description: "Evaluate knowledge of sales approaches and techniques",
      module: "sales",
      questionCount: 15,
      passingScore: 75,
      createdAt: "2023-08-15"
    },
    {
      id: "3",
      title: "Relationship Building Assessment",
      description: "Test understanding of relationship management principles",
      module: "relationship",
      questionCount: 8,
      passingScore: 80,
      createdAt: "2023-09-10"
    },
  ];

  const assessments = [
    {
      id: "1",
      title: "Initial Sales Knowledge",
      description: "Basic sales knowledge assessment for screening candidates",
      questionCount: 20,
      difficulty: "Basic",
      createdAt: "2023-06-15"
    },
    {
      id: "2",
      title: "Product Features Comprehension",
      description: "Detailed assessment of product feature knowledge",
      questionCount: 15,
      difficulty: "Intermediate",
      createdAt: "2023-07-20"
    },
    {
      id: "3",
      title: "Advanced Sales Scenarios",
      description: "Complex sales scenario evaluation for final interviews",
      questionCount: 10,
      difficulty: "Advanced",
      createdAt: "2023-08-25"
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

  const initiateDeleteUser = (userId: string) => {
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

  const handleAddVideo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("New training video added successfully");
    setShowVideoDialog(false);
    // Reset form
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  const handleAddQuiz = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("New quiz added successfully");
    setShowQuizDialog(false);
    // Reset form
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  const handleAddAssessment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("New assessment created successfully");
    setShowAssessmentDialog(false);
    // Reset form
    const form = e.target as HTMLFormElement;
    form.reset();
  };

  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast.success(`User status changed to ${newStatus}`);
  };

  const handleDeleteContent = (contentType: string, id: string) => {
    toast.success(`${contentType} deleted successfully`);
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

        {/* Tabs for different management functions */}
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full md:w-[600px]">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="videos">Training Videos</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
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

                    <div className="space-y-2" id="regions-select">
                      <Label htmlFor="regions">Regions (For Managers)</Label>
                      <Select defaultValue="north">
                        <SelectTrigger>
                          <SelectValue placeholder="Select regions" />
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
                                {user.role === "manager" && user.regions && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {user.regions.map((region, index) => (
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
                <Button variant="outline" size="sm">
                  Export User Data
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Training Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Training Videos</h2>
                <p className="text-muted-foreground">Manage training video content for candidates</p>
              </div>
              <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add New Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Training Video</DialogTitle>
                    <DialogDescription>
                      Upload a new training video for candidate education.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddVideo}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Video Title</Label>
                        <Input id="title" placeholder="Enter video title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          placeholder="Enter video description" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="module">Module</Label>
                        <Select defaultValue="product">
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">Product Knowledge</SelectItem>
                            <SelectItem value="sales">Sales Techniques</SelectItem>
                            <SelectItem value="relationship">Relationship Building</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Video URL</Label>
                        <Input 
                          id="videoUrl" 
                          placeholder="https://example.com/video" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (MM:SS)</Label>
                        <Input 
                          id="duration" 
                          placeholder="12:34" 
                          required 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowVideoDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Video</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead className="hidden md:table-cell">Duration</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainingVideos.map((video) => (
                        <TableRow key={video.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center">
                                <Video className="h-4 w-4 mr-2 text-primary" />
                                {video.title}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {video.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              video.module === "product" 
                                ? "bg-blue-100 text-blue-800" 
                                : video.module === "sales" 
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }>
                              {video.module === "product" 
                                ? "Product Knowledge" 
                                : video.module === "sales" 
                                ? "Sales Techniques"
                                : "Relationship Building"
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {video.duration}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Edit Video"
                              >
                                <PenLine className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete Video"
                                onClick={() => handleDeleteContent('Video', video.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Training Quizzes</h2>
                <p className="text-muted-foreground">Manage quizzes for training module assessment</p>
              </div>
              <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add New Quiz
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Training Quiz</DialogTitle>
                    <DialogDescription>
                      Create a new quiz to assess candidate knowledge.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddQuiz}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="quizTitle">Quiz Title</Label>
                        <Input id="quizTitle" placeholder="Enter quiz title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quizDescription">Description</Label>
                        <Textarea 
                          id="quizDescription" 
                          placeholder="Enter quiz description" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quizModule">Module</Label>
                        <Select defaultValue="product">
                          <SelectTrigger>
                            <SelectValue placeholder="Select module" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">Product Knowledge</SelectItem>
                            <SelectItem value="sales">Sales Techniques</SelectItem>
                            <SelectItem value="relationship">Relationship Building</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="questionCount">Number of Questions</Label>
                        <Input 
                          id="questionCount" 
                          type="number" 
                          min="1"
                          placeholder="10" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passingScore">Passing Score (%)</Label>
                        <Input 
                          id="passingScore" 
                          type="number"
                          min="1"
                          max="100"
                          placeholder="70" 
                          required 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowQuizDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Quiz</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Module</TableHead>
                        <TableHead className="hidden md:table-cell">Questions</TableHead>
                        <TableHead className="hidden md:table-cell">Pass Score</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizzes.map((quiz) => (
                        <TableRow key={quiz.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-primary" />
                                {quiz.title}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {quiz.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              quiz.module === "product" 
                                ? "bg-blue-100 text-blue-800" 
                                : quiz.module === "sales" 
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                            }>
                              {quiz.module === "product" 
                                ? "Product Knowledge" 
                                : quiz.module === "sales" 
                                ? "Sales Techniques"
                                : "Relationship Building"
                              }
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {quiz.questionCount} questions
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {quiz.passingScore}%
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Edit Quiz"
                              >
                                <PenLine className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete Quiz"
                                onClick={() => handleDeleteContent('Quiz', quiz.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assessments Tab */}
          <TabsContent value="assessments" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Assessments</h2>
                <p className="text-muted-foreground">Manage candidate assessments for the hiring process</p>
              </div>
              <Dialog open={showAssessmentDialog} onOpenChange={setShowAssessmentDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Create Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Create New Assessment</DialogTitle>
                    <DialogDescription>
                      Create a new assessment for evaluating candidates.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAssessment}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="assessmentTitle">Assessment Title</Label>
                        <Input id="assessmentTitle" placeholder="Enter assessment title" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assessmentDescription">Description</Label>
                        <Textarea 
                          id="assessmentDescription" 
                          placeholder="Enter assessment description" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="assessmentQuestionCount">Number of Questions</Label>
                        <Input 
                          id="assessmentQuestionCount" 
                          type="number" 
                          min="1"
                          placeholder="15" 
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select defaultValue="basic">
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowAssessmentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Assessment</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead className="hidden md:table-cell">Questions</TableHead>
                        <TableHead className="hidden md:table-cell">Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-primary" />
                                {assessment.title}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {assessment.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              assessment.difficulty === "Basic" 
                                ? "bg-green-100 text-green-800" 
                                : assessment.difficulty === "Intermediate" 
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                            }>
                              {assessment.difficulty}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {assessment.questionCount} questions
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(assessment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Edit Assessment"
                              >
                                <PenLine className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                title="Delete Assessment"
                                onClick={() => handleDeleteContent('Assessment', assessment.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
