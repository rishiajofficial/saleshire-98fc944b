
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BarChart,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Users,
  CheckCircle2,
  XCircle,
  UserCheck,
  TrendingUp,
  Activity
} from "lucide-react";

const Analytics = () => {
  // Mock data for charts and metrics
  const recruitmentMetrics = {
    totalCandidates: 86,
    totalCandidatesChange: 12,
    applicationsThisMonth: 24,
    applicationsThisMonthChange: 8,
    hiredThisMonth: 3,
    hiredThisMonthChange: 1,
    conversionRate: 12.5,
    conversionRateChange: -2.3,
  };

  const funnelData = [
    { name: "Application Pass Rate", value: 65 },
    { name: "Training Completion", value: 78 },
    { name: "Sales Task Success", value: 45 },
    { name: "Hire Rate", value: 30 },
  ];

  const assessmentPerformance = [
    { name: "Initial Screening", avgScore: 72, submissions: 24 },
    { name: "Product Knowledge", avgScore: 84, submissions: 18 },
    { name: "Sales Techniques", avgScore: 76, submissions: 15 },
    { name: "Objection Handling", avgScore: 81, submissions: 12 },
    { name: "Final Assessment", avgScore: 79, submissions: 8 },
  ];

  const hiringTrends = {
    candidates: [12, 18, 22, 19, 24, 21, 15, 14, 20, 24, 28, 30],
    hires: [2, 3, 4, 3, 3, 2, 2, 3, 4, 4, 5, 5],
    months: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track recruitment performance and candidate metrics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Candidates
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {recruitmentMetrics.totalCandidates}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-xs flex items-center ${recruitmentMetrics.totalCandidatesChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {recruitmentMetrics.totalCandidatesChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(recruitmentMetrics.totalCandidatesChange)}% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Applications This Month
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {recruitmentMetrics.applicationsThisMonth}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-xs flex items-center ${recruitmentMetrics.applicationsThisMonthChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {recruitmentMetrics.applicationsThisMonthChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(recruitmentMetrics.applicationsThisMonthChange)}% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Hired This Month
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {recruitmentMetrics.hiredThisMonth}
                  </h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-xs flex items-center ${recruitmentMetrics.hiredThisMonthChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {recruitmentMetrics.hiredThisMonthChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(recruitmentMetrics.hiredThisMonthChange)} from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Conversion Rate
                  </p>
                  <h3 className="text-3xl font-bold mt-1">
                    {recruitmentMetrics.conversionRate}%
                  </h3>
                </div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className={`text-xs flex items-center ${recruitmentMetrics.conversionRateChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {recruitmentMetrics.conversionRateChange >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(recruitmentMetrics.conversionRateChange)}% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="funnel">Recruitment Funnel</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Trends</CardTitle>
                  <CardDescription>
                    Candidates and hires over the past 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center p-8 space-y-2">
                      <LineChart className="h-12 w-12 text-muted-foreground mx-auto" />
                      <h3 className="font-medium">Line chart showing hiring trends</h3>
                      <p className="text-sm text-muted-foreground">
                        Candidates vs. Hires over the past 12 months
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recruitment Funnel</CardTitle>
                  <CardDescription>
                    Conversion rates at each stage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {funnelData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm">{item.name}</span>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{ width: `${item.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Sources</CardTitle>
                  <CardDescription>
                    Where candidates are coming from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-center justify-center">
                    <div className="text-center p-4">
                      <PieChart className="h-12 w-12 text-muted-foreground mx-auto" />
                      <h3 className="font-medium mt-2">Pie chart showing application sources</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>
                    Candidates with highest assessment scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {[
                      { name: "Emily Davis", score: 91 },
                      { name: "Sarah Brown", score: 88 },
                      { name: "David Wilson", score: 85 },
                      { name: "Michael Johnson", score: 82 },
                      { name: "Jane Smith", score: 78 }
                    ].map((candidate, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="ml-2 text-sm font-medium">{candidate.name}</span>
                        </div>
                        <span className="font-semibold">{candidate.score}%</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hiring Status</CardTitle>
                  <CardDescription>
                    Current recruitment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                        <span>Approved</span>
                      </div>
                      <span className="font-medium">8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 text-amber-500 mr-2" />
                        <span>In Progress</span>
                      </div>
                      <span className="font-medium">15</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <span>Rejected</span>
                      </div>
                      <span className="font-medium">12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Funnel Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of candidate progression through each stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center p-8 space-y-2">
                    <BarChart className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="font-medium">Detailed funnel visualization</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete recruitment funnel with dropoff rates
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stage Conversion Rates</CardTitle>
                  <CardDescription>
                    Percentage of candidates advancing to the next stage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Application → Screening</span>
                        <span className="font-medium">75%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Screening → Training</span>
                        <span className="font-medium">60%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Training → Sales Task</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Sales Task → Interview</span>
                        <span className="font-medium">70%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Interview → Hired</span>
                        <span className="font-medium">40%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bottlenecks & Opportunities</CardTitle>
                  <CardDescription>
                    Areas for improvement in the recruitment process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-md p-4 bg-amber-50 border-amber-200">
                    <h3 className="font-medium text-amber-800 mb-1">Training Completion Rate</h3>
                    <p className="text-sm text-amber-700">
                      Only 60% of candidates successfully complete all training modules. 
                      Consider reviewing the most challenging sections.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-red-50 border-red-200">
                    <h3 className="font-medium text-red-800 mb-1">Sales Task Conversion</h3>
                    <p className="text-sm text-red-700">
                      The sales task has the lowest pass rate at 45%. This stage has the highest 
                      dropout rate in the entire funnel.
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4 bg-green-50 border-green-200">
                    <h3 className="font-medium text-green-800 mb-1">Screening Efficiency</h3>
                    <p className="text-sm text-green-700">
                      Initial screening is highly efficient with 75% of candidates moving forward. 
                      The current screening criteria are well-calibrated.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Performance</CardTitle>
                <CardDescription>
                  Average scores and submission rates by assessment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center p-8 space-y-2">
                    <BarChart className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="font-medium">Bar chart of assessment performance</h3>
                    <p className="text-sm text-muted-foreground">
                      Comparing scores across different assessments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Scores</CardTitle>
                  <CardDescription>
                    Average scores for each assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assessmentPerformance.map((assessment, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{assessment.name}</span>
                          <span className="text-sm font-medium">{assessment.avgScore}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              assessment.avgScore >= 80 ? "bg-green-500" : 
                              assessment.avgScore >= 70 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${assessment.avgScore}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-end">
                          <span className="text-xs text-muted-foreground">
                            {assessment.submissions} submissions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Problem Areas</CardTitle>
                  <CardDescription>
                    Questions with lowest success rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Objection Handling - Question 8</span>
                        <span className="text-red-600 font-medium">32% success</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        "How would you handle a customer who claims our product is too expensive?"
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Sales Techniques - Question 12</span>
                        <span className="text-red-600 font-medium">35% success</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        "Describe the SPIN selling method and when to use it."
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Product Knowledge - Question 7</span>
                        <span className="text-red-600 font-medium">41% success</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        "Compare the advantages of our premium vs standard product lines."
                      </p>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Final Assessment - Question 23</span>
                        <span className="text-red-600 font-medium">44% success</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        "Create a personalized sales strategy for the described customer scenario."
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Analytics;
