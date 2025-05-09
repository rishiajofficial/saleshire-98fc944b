
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from "@/components/ui/timeline";

export interface StatusHistoryEntry {
  id: string;
  application_id: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_by: string;
  updated_by_user?: {
    name: string;
  };
}

interface ApplicationStatusHistoryProps {
  applicationId: string;
}

export const ApplicationStatusHistory: React.FC<ApplicationStatusHistoryProps> = ({ applicationId }) => {
  const [historyItems, setHistoryItems] = useState<StatusHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('application_status_history')
          .select(`
            *,
            updated_by_user:profiles!application_status_history_updated_by_fkey(name)
          `)
          .eq('application_id', applicationId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setHistoryItems(data as StatusHistoryEntry[]);
      } catch (error) {
        console.error("Error fetching application history:", error);
        setHistoryItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchHistory();
    }
  }, [applicationId]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-500';
      case 'hr_review':
      case 'screening':
        return 'bg-yellow-500';
      case 'hr_approved':
        return 'bg-violet-500';
      case 'manager_interview':
      case 'interview':
        return 'bg-green-500';
      case 'hired':
        return 'bg-emerald-500';
      case 'rejected':
        return 'bg-red-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-primary';
    }
  };

  if (isLoading) {
    return <div className="text-sm text-center py-2">Loading history...</div>;
  }

  if (historyItems.length === 0) {
    return <div className="text-sm text-muted-foreground">No status history available</div>;
  }

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Application History</h4>
      <Timeline>
        {historyItems.map((item) => (
          <TimelineItem key={item.id}>
            <TimelineOppositeContent className="text-xs text-muted-foreground">
              {formatDate(item.created_at)}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot className={getStatusColor(item.status)} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <div className="text-sm font-medium capitalize">
                {item.status.replace('_', ' ')}
              </div>
              {item.notes && (
                <p className="text-xs text-muted-foreground mt-1">{item.notes}</p>
              )}
              <p className="text-xs mt-1">
                {item.updated_by_user?.name ? `By ${item.updated_by_user.name}` : 'By system'}
              </p>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};

export default ApplicationStatusHistory;
