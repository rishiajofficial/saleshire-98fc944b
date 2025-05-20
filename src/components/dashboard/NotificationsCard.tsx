
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { Tables } from "@/integrations/supabase/types";

type ActivityLog = Tables<'activity_logs'>;

interface NotificationsCardProps {
  notifications: ActivityLog[];
}

export const NotificationsCard = ({ notifications }: NotificationsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent notifications.</p>
          ) : (
            notifications.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border"
              >
                <p className="text-sm font-medium">
                  {log.action.replace(/_/g, ' ')} - <span className="text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </span>
                </p>
                {log.details && <p className="text-xs text-muted-foreground">{JSON.stringify(log.details)}</p>}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
