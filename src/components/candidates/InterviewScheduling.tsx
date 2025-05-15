
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Interview {
  id: string;
  scheduled_at: string;
  status: string;
  notes?: string;
  manager_id?: string;
}

interface InterviewSchedulingProps {
  interviews: Interview[];
}

export const InterviewScheduling: React.FC<InterviewSchedulingProps> = ({ interviews }) => {
  // Helper to format the date
  const formatInterviewDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'confirmed': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Scheduling</CardTitle>
        <CardDescription>
          Manage candidate interviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {interviews.length > 0 ? (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div key={interview.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">
                      {formatInterviewDate(interview.scheduled_at)}
                    </span>
                  </div>
                  <Badge className={`${getStatusColor(interview.status)} text-white`}>
                    {interview.status}
                  </Badge>
                </div>
                {interview.notes && (
                  <p className="text-sm text-gray-600 mt-2">{interview.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">No interviews scheduled yet.</p>
            <Button>Schedule Interview</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
