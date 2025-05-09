
import React from "react";
import { format } from "date-fns";
import { Timeline, TimelineItem, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent, TimelineSeparator } from "@/components/ui/timeline";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface StatusHistoryItem {
  id: string;
  status: string;
  created_at: string;
  updated_by: string;
  notes?: string;
}

interface ApplicationStatusHistoryProps {
  applicationId: string;
}

export const ApplicationStatusHistory: React.FC<ApplicationStatusHistoryProps> = ({ 
  applicationId 
}) => {
  const { data: statusHistory, isLoading } = useQuery({
    queryKey: ['application-status-history', applicationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('application_status_history')
        .select(`*, updated_by_user:profiles!updated_by(name)`)
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StatusHistoryItem[];
    },
    enabled: !!applicationId
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No status history available.
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "applied":
        return <Badge className="bg-blue-100 text-blue-800">Applied</Badge>;
      case "screening":
      case "hr_review":
        return <Badge className="bg-yellow-100 text-yellow-800">HR Review</Badge>;
      case "hr_approved":
      case "training":
        return <Badge className="bg-purple-100 text-purple-800">Training</Badge>;
      case "manager_interview":
        return <Badge className="bg-green-100 text-green-800">Interview</Badge>;
      case "sales_task":
        return <Badge className="bg-orange-100 text-orange-800">Sales Task</Badge>;
      case "hired":
        return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-3 space-y-4">
      <h3 className="font-semibold text-lg">Status History</h3>
      <Timeline>
        {statusHistory.map((item) => (
          <TimelineItem key={item.id}>
            <TimelineOppositeContent className="text-xs text-muted-foreground">
              {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent className="py-2 px-4">
              <div className="space-y-1">
                {getStatusBadge(item.status)}
                {item.notes && (
                  <p className="text-sm mt-1">{item.notes}</p>
                )}
                {item.updated_by_user?.name && (
                  <p className="text-xs text-muted-foreground">
                    Updated by {item.updated_by_user.name}
                  </p>
                )}
              </div>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};
