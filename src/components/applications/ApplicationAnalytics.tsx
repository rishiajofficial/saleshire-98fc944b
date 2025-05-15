
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ApplicationAnalyticsProps {
  role?: string;
  userId?: string;
}

export const ApplicationAnalytics: React.FC<ApplicationAnalyticsProps> = ({ role, userId }) => {
  // Mock data for demonstration
  const statusData = [
    { name: 'Applied', value: 32 },
    { name: 'HR Review', value: 18 },
    { name: 'Training', value: 12 },
    { name: 'Sales Task', value: 7 },
    { name: 'Interview', value: 5 },
    { name: 'Hired', value: 3 },
    { name: 'Rejected', value: 15 },
  ];
  
  const timeData = [
    { name: 'Week 1', applications: 14 },
    { name: 'Week 2', applications: 21 },
    { name: 'Week 3', applications: 28 },
    { name: 'Week 4', applications: 19 },
  ];
  
  const COLORS = ['#0088FE', '#FFBB28', '#8884d8', '#82ca9d', '#FF8042', '#00C49F', '#ff0000'];
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Applications by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [value, 'Applications']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center text-xs">
                  <div 
                    className="w-3 h-3 mr-1 rounded-sm" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <span className="mr-1">{entry.name}:</span>
                  <span className="font-medium">{entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Applications Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Application Metrics</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-md p-3 text-center">
              <div className="text-2xl font-bold">92</div>
              <div className="text-sm text-muted-foreground">Total Applications</div>
            </div>
            <div className="border rounded-md p-3 text-center">
              <div className="text-2xl font-bold">21%</div>
              <div className="text-sm text-muted-foreground">Interview Rate</div>
            </div>
            <div className="border rounded-md p-3 text-center">
              <div className="text-2xl font-bold">12%</div>
              <div className="text-sm text-muted-foreground">Hire Rate</div>
            </div>
            <div className="border rounded-md p-3 text-center">
              <div className="text-2xl font-bold">3.5 days</div>
              <div className="text-sm text-muted-foreground">Avg. Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
