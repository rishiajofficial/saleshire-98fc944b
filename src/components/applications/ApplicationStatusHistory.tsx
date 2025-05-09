
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { StatusBadge } from "@/components/candidates/StatusBadge";

interface StatusHistoryEntry {
  id: string;
  application_id: string;
  status: string;
  updated_by: string;
  notes?: string;
  created_at: string;
  updated_by_name?: string;
}

interface ApplicationStatusHistoryProps {
  applicationId: string;
}

export const ApplicationStatusHistory: React.FC<ApplicationStatusHistoryProps> = ({
  applicationId,
}) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!applicationId) return;
      
      setIsLoading(true);
      
      try {
        // Since we don't have a dedicated status history table yet, we'll use activity logs
        const { data, error } = await supabase
          .from('activity_logs')
          .select(`
            *,
            updated_by_user:user_id(
              name
            )
          `)
          .eq('entity_type', 'job_application')
          .eq('entity_id', applicationId)
          .eq('action', 'status_change')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform activity logs into status history entries
        const formattedHistory: StatusHistoryEntry[] = data?.map(log => {
          const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
          
          return {
            id: log.id,
            application_id: log.entity_id,
            status: details?.new_status || 'unknown',
            updated_by: log.user_id,
            notes: details?.notes || '',
            created_at: log.created_at,
            updated_by_name: log.updated_by_user?.name || 'System'
          };
        }) || [];
        
        setHistory(formattedHistory);
      } catch (err) {
        console.error("Error fetching application status history:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [applicationId]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>Loading status history...</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
          <CardDescription>No status changes have been recorded yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status History</CardTitle>
        <CardDescription>
          Track the history of status changes for this application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry.id} className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={entry.status} />
                    <span className="text-sm font-medium">
                      Changed by {entry.updated_by_name || "System"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(entry.created_at), "PPpp")}
                  </p>
                </div>
              </div>
              
              {entry.notes && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {entry.notes}
                </div>
              )}
              
              {index < history.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
