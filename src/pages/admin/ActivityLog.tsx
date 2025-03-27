
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle,
  Download,
  FileText,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  User,
  UserPlus,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ActivityLog = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock activity data
  const activities = [
    {
      id: 1,
      user: "Admin",
      userType: "admin",
      action: "Added new training video: 'Product Knowledge: Security Locks Overview'",
      type: "content",
      timestamp: "2023-10-15T11:23:45"
    },
    {
      id: 2,
      user: "John Smith",
      userType: "manager",
      action: "Created interview for candidate Robert Johnson",
      type: "interview",
      timestamp: "2023-10-15T10:12:30"
    },
    {
      id: 3,
      user: "System",
      userType: "system",
      action: "Automated user cleanup: 3 inactive accounts archived",
      type: "system",
      timestamp: "2023-10-14T23:15:00"
    },
    {
      id: 4,
      user: "Emma Johnson",
      userType: "manager",
      action: "Evaluated sales task for Jane Smith - Passed",
      type: "assessment",
      timestamp: "2023-10-14T14:45:20"
    },
    {
      id: 5,
      user: "Admin",
      userType: "admin",
      action: "Created new quiz: 'Product Features Comprehension'",
      type: "content",
      timestamp: "2023-10-14T12:05:10"
    },
    {
      id: 6,
      user: "Lisa Brown",
      userType: "admin",
      action: "Updated system settings: Changed minimum pass score to 70%",
      type: "system",
      timestamp: "2023-10-14T09:30:15"
    },
    {
      id: 7,
      user: "Robert Johnson",
      userType: "candidate",
      action: "Completed training module: 'Sales Techniques'",
      type: "training",
      timestamp: "2023-10-13T16:22:40"
    },
    {
      id: 8,
      user: "Admin",
      userType: "admin",
      action: "Created new user account: Michael Davis (Manager)",
      type: "user",
      timestamp: "2023-10-13T11:10:05"
    },
    {
      id: 9,
      user: "Jane Smith",
      userType: "candidate",
      action: "Submitted sales task for evaluation",
      type: "application",
      timestamp: "2023-10-12T15:35:20"
    },
    {
      id: 10,
      user: "John Smith",
      userType: "manager",
      action: "Deleted draft assessment: 'Initial Product Quiz'",
      type: "content",
      timestamp: "2023-10-12T09:15:30"
    },
    {
      id: 11,
      user: "System",
      userType: "system",
      action: "Weekly data backup completed",
      type: "system",
      timestamp: "2023-10-11T03:00:00"
    },
    {
      id: 12,
      user: "Emma Johnson",
      userType: "manager",
      action: "Assigned 5 new candidates to North region",
      type: "user",
      timestamp: "2023-10-10T14:25:10"
    }
  ];

  // Filter activities based on selected filter and search term
  const filteredActivities = activities
    .filter(activity => {
      if (filter === "all") return true;
      return activity.type === filter;
    })
    .filter(activity => {
      if (!searchTerm) return true;
      return (
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  // Helper function to get the icon for each activity type
  const getActivityIcon = (type: string, userType: string) => {
    switch(type) {
      case "content":
        return <FileText className="h-5 w-5 text-blue-600" />;
      case "interview":
        return <CalendarRange className="h-5 w-5 text-purple-600" />;
      case "assessment":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "training":
        return <Video className="h-5 w-5 text-amber-600" />;
      case "user":
        return <UserPlus className="h-5 w-5 text-indigo-600" />;
      case "application":
        return <User className="h-5 w-5 text-teal-600" />;
      case "system":
        return userType === "admin" 
          ? <ShieldAlert className="h-5 w-5 text-red-600" />
          : <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
            <p className="text-muted-foreground mt-2">
              Complete history of system activities
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard/admin">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Admin Dashboard
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Search activities..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="user">User Management</SelectItem>
                <SelectItem value="content">Content Management</SelectItem>
                <SelectItem value="assessment">Assessments</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="application">Applications</SelectItem>
                <SelectItem value="interview">Interviews</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" /> Export Log
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
            <CardDescription>
              Showing {filteredActivities.length} of {activities.length} activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start p-4 border rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.type, activity.userType)}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{activity.user}</span>
                            <Badge variant="outline" className={
                              activity.userType === "admin" ? "border-purple-500 text-purple-700" :
                              activity.userType === "manager" ? "border-blue-500 text-blue-700" :
                              activity.userType === "candidate" ? "border-green-500 text-green-700" :
                              "border-gray-500 text-gray-700"
                            }>
                              {activity.userType === "admin" ? "Admin" :
                               activity.userType === "manager" ? "Manager" :
                               activity.userType === "candidate" ? "Candidate" :
                               "System"}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">
                            {activity.action}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 sm:mt-0 whitespace-nowrap">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="mt-1 text-xs">{activity.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No activities found</h3>
                  <p className="text-muted-foreground mt-2 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilter("all");
                      setSearchTerm("");
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ActivityLog;
