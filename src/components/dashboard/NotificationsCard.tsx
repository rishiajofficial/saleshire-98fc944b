
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Tables } from "@/integrations/supabase/types";

type ActivityLog = Tables<'activity_logs'>;

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
}

interface NotificationsCardProps {
  heading?: string;
  notifications: ActivityLog[] | NotificationItem[];
}

export const NotificationsCard = ({ heading = "Notifications", notifications }: NotificationsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{heading}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent notifications.</p>
          ) : (
            notifications.map((log) => {
              // Check if the item is an ActivityLog or a NotificationItem
              const isActivityLog = 'action' in log && 'created_at' in log;
              
              const title = isActivityLog 
                ? (log.action ? log.action.replace(/_/g, ' ') : 'Activity')
                : log.title;
              
              const time = isActivityLog
                ? formatDistanceToNow(new Date(log.created_at), { addSuffix: true })
                : log.time;
              
              const details = isActivityLog 
                ? (log.details ? JSON.stringify(log.details) : '')
                : log.message;
              
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border"
                >
                  <p className="text-sm font-medium">
                    {title} - <span className="text-muted-foreground">
                      {time}
                    </span>
                  </p>
                  {details && <p className="text-xs text-muted-foreground">{details}</p>}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
