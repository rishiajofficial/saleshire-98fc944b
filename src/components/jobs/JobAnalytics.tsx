
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, ChartContainer, XAxis, YAxis, Bar } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Job } from "@/types/job";

interface JobAnalyticsProps {
  jobs: Job[];
  applications: any[];
}

export const JobAnalytics: React.FC<JobAnalyticsProps> = ({ jobs, applications }) => {
  // Calculate job metrics
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active' && !job.archived).length;
  const archivedJobs = jobs.filter(job => job.archived).length;
  
  // Calculate application metrics
  const totalApplications = applications.length;
  const applicationsPerJob = jobs.map(job => {
    const jobApps = applications.filter(app => app.job_id === job.id);
    return {
      name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
      applications: jobApps.length
    };
  }).sort((a, b) => b.applications - a.applications).slice(0, 5);

  const applicationsByStatus = applications.reduce((acc: Record<string, number>, app) => {
    const status = app.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const applicationStatusData = Object.entries(applicationsByStatus).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Job Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Jobs</CardTitle>
            <CardDescription>All jobs in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalJobs}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Jobs</CardTitle>
            <CardDescription>Currently active job listings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeJobs}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Applications</CardTitle>
            <CardDescription>All job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalApplications}</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">Applications Per Job</TabsTrigger>
          <TabsTrigger value="statuses">Application Statuses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Jobs by Applications</CardTitle>
              <CardDescription>Jobs with most applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartContainer
                  columns={applicationsPerJob.length}
                >
                  <BarChart
                    data={applicationsPerJob}
                    layout="horizontal"
                    showXAxis
                    showYAxis
                    showTooltip
                    showLegend
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="applications" fill="hsl(var(--primary))" />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="statuses">
          <Card>
            <CardHeader>
              <CardTitle>Applications by Status</CardTitle>
              <CardDescription>Current distribution of application statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartContainer
                  columns={applicationStatusData.length}
                >
                  <BarChart
                    data={applicationStatusData}
                    layout="horizontal"
                    showXAxis
                    showYAxis
                    showTooltip
                    showLegend
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
