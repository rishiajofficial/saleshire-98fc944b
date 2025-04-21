
import React, { useState, useEffect } from "react";
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
import useDatabaseQuery from "@/hooks/useDatabaseQuery";
import { toast } from "sonner";

const ActivityLog = () => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all activity logs, ordered by most recent first
  const { data: activityLogs, isLoading } = useDatabaseQuery<any[]>('activity_logs', {
    order: ['created_at', { ascending: false }]
  });

  // Fetch users to map user_id to names
  const { data: users } = useDatabaseQuery<any[]>('profiles');

  // Process and format activity logs
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (activityLogs && users) {
      const processedLogs = activityLogs.map(log => {
        const user = users.find(u => u.id === log.user_id);
        return {
          id: log.id,
          user: user?.name || 'Unknown User',
          userType: user?.role || 'system',
          action: log.action,
          type: log.entity_type,
          timestamp: log.created_at
        };
      });
      setActivities(processedLogs);
    }
  }, [activityLogs, users]);

  // Handle exporting logs
  const handleExport = () => {
    if (!activities || activities.length === 0) {
      toast.error("No activities to export");
      return;
    }

    // Format the activities for CSV export
    const csvContent = [
      // Header row
      ['User', 'Type', 'Action', 'Entity Type', 'Timestamp'].join(','),
      // Data rows
      ...activities.map(activity => [
        `"${activity.user}"`,
        `"${activity.userType}"`,
        `"${activity.action}"`,
        `"${activity.type}"`,
        `"${formatDate(activity.timestamp)}"`
      ].join(','))
    ].join('\n');

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity-log-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Activity log exported successfully");
  };

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

  // Handle relative time display
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading activity logs...</p>
        </div>
      </MainLayout>
    );
  }

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
          <Button variant="outline" className="w-full sm:w-auto" onClick={handleExport}>
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
                          {getRelativeTime(activity.timestamp)}
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
