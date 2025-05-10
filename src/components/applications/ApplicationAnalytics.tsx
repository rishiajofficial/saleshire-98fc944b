
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';

interface ApplicationAnalyticsProps {
  role: string;
  userId?: string;
}

export const ApplicationAnalytics: React.FC<ApplicationAnalyticsProps> = ({ role, userId }) => {
  // Mock data for the charts
  const applicationsByStatusData = [
    { status: 'Applied', value: 12 },
    { status: 'HR Review', value: 8 },
    { status: 'Interview', value: 5 },
    { status: 'Hired', value: 3 },
    { status: 'Rejected', value: 4 },
  ];

  const applicationsByWeekData = [
    { week: 'Week 1', value: 5 },
    { week: 'Week 2', value: 7 },
    { week: 'Week 3', value: 10 },
    { week: 'Week 4', value: 8 },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Application Analytics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Applications by Status</h4>
            <div className="h-64">
              <BarChart width={400} height={250} data={applicationsByStatusData}>
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Applications by Week</h4>
            <div className="h-64">
              <BarChart width={400} height={250} data={applicationsByWeekData}>
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationAnalytics;
