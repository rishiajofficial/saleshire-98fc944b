
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationAnalyticsProps {
  role: string;
  userId?: string;
}

export const ApplicationAnalytics: React.FC<ApplicationAnalyticsProps> = ({
  role,
  userId
}) => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['application-analytics', userId, role],
    queryFn: async () => {
      // This would typically call the database to get real analytics
      // For now, we'll return mock data
      
      // Optional: Actually fetch data from Supabase
      const { data: statusData, error: statusError } = await supabase
        .from('job_applications')
        .select('status, count')
        .eq(role === 'manager' ? 'jobs.created_by' : null, userId)
        .group_by('status');
        
      if (statusError) {
        console.error("Error fetching analytics data:", statusError);
      }
      
      // Placeholder data in case the query didn't work
      const statusCounts = statusData || [
        { status: "applied", count: 15 },
        { status: "hr_review", count: 8 },
        { status: "training", count: 5 },
        { status: "manager_interview", count: 3 },
        { status: "hired", count: 2 },
        { status: "rejected", count: 4 }
      ];
      
      // Mock trend data
      const trendData = [
        { month: "Jan", applications: 4 },
        { month: "Feb", applications: 7 },
        { month: "Mar", applications: 5 },
        { month: "Apr", applications: 12 },
        { month: "May", applications: 14 },
        { month: "Jun", applications: 8 }
      ];
      
      return {
        statusCounts,
        trendData,
        totalApplications: statusCounts.reduce((sum, item) => sum + parseInt(item.count), 0),
        conversionRate: Math.round((2 / 37) * 100) // Mock data: hired / total
      };
    }
  });

  if (isLoading || !analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>
            Loading application analytics...
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Loading analytics data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF0000'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Analytics</CardTitle>
        <CardDescription>
          Overview of job applications and their statuses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{analyticsData.totalApplications}</div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{analyticsData.statusCounts.find(s => s.status === 'hired')?.count || 0}</div>
            <div className="text-sm text-muted-foreground">Candidates Hired</div>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="text-2xl font-bold">{analyticsData.conversionRate}%</div>
            <div className="text-sm text-muted-foreground">Conversion Rate</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Applications by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.statusCounts}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analyticsData.statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Application Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Status Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {analyticsData.statusCounts.map((status) => (
              <div key={status.status} className="bg-muted/30 p-3 rounded-md flex justify-between">
                <Badge className="capitalize">{status.status.replace('_', ' ')}</Badge>
                <span className="font-semibold">{status.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
