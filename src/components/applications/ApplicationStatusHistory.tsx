
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  notes?: string;
}

interface ApplicationStatusHistoryProps {
  applicationId: string;
}

export const ApplicationStatusHistory: React.FC<ApplicationStatusHistoryProps> = ({ applicationId }) => {
  // In a real app, you would fetch the status history from your API
  const statusHistory: StatusHistoryItem[] = [
    { status: 'applied', timestamp: '2023-06-01T10:00:00Z' },
    { status: 'hr_review', timestamp: '2023-06-02T14:30:00Z', notes: 'Application looks promising' },
    { status: 'hr_approved', timestamp: '2023-06-04T09:15:00Z', notes: 'Ready for training' }
  ];
  
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div>
        <h4 className="text-sm font-medium mb-2">Status History</h4>
        <p className="text-sm text-muted-foreground">No status updates recorded.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Status History</h4>
      <div className="space-y-3">
        {statusHistory.map((item, index) => (
          <div key={index} className="flex space-x-2 text-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
            <div>
              <p className="font-medium">
                {item.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
              </p>
              {item.notes && (
                <p className="text-xs mt-1">{item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
