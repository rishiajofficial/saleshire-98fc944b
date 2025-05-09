
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsData {
  status: string;
  count: number;
}

export const ApplicationAnalytics = () => {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string>("all_time");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Define the date range for the query
        let dateFilter = {};
        const now = new Date();
        
        if (timeframe === "last_week") {
          const lastWeek = new Date();
          lastWeek.setDate(now.getDate() - 7);
          dateFilter = { created_at: { gte: lastWeek.toISOString() } };
        } else if (timeframe === "last_month") {
          const lastMonth = new Date();
          lastMonth.setMonth(now.getMonth() - 1);
          dateFilter = { created_at: { gte: lastMonth.toISOString() } };
        } else if (timeframe === "last_year") {
          const lastYear = new Date();
          lastYear.setFullYear(now.getFullYear() - 1);
          dateFilter = { created_at: { gte: lastYear.toISOString() } };
        }
        
        // Instead of using group_by which doesn't exist, we'll fetch all applications
        // and aggregate the counts in JS
        const { data: applications, error } = await supabase
          .from('job_applications')
          .select('status, created_at')
          .order('created_at', { ascending: false });
          
        if (error) throw error;

        // Filter by date if needed
        let filteredApplications = applications;
        if (timeframe !== "all_time") {
          const cutoffDate = new Date();
          if (timeframe === "last_week") {
            cutoffDate.setDate(cutoffDate.getDate() - 7);
          } else if (timeframe === "last_month") {
            cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          } else if (timeframe === "last_year") {
            cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
          }
          
          filteredApplications = applications.filter(app => 
            new Date(app.created_at) >= cutoffDate
          );
        }
        
        // Aggregate the data manually
        const statusCounts: Record<string, number> = {};
        
        filteredApplications.forEach(app => {
          const status = app.status || 'unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
        
        // Transform the aggregated data
        const chartData = Object.entries(statusCounts).map(([status, count]) => ({
          status: formatStatus(status),
          count
        }));
        
        setData(chartData);
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeframe]);

  // Helper to format status for display
  const formatStatus = (status: string): string => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Application Analytics</CardTitle>
            <CardDescription>Overview of application statuses</CardDescription>
          </div>
          <Select
            value={timeframe}
            onValueChange={(value) => setTimeframe(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_time">All Time</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center text-red-500">
            Error: {error}
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No application data available for the selected timeframe.
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
