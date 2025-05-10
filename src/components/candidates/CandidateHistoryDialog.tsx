
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";

interface CandidateHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  isLoading: boolean;
  logs: Array<{
    id: string;
    action: string;
    created_at: string;
    details?: any;
  }>;
}

export const CandidateHistoryDialog: React.FC<CandidateHistoryDialogProps> = ({
  isOpen,
  onClose,
  candidateName,
  isLoading,
  logs,
}) => {
  const formatLogAction = (log: any) => {
    if (log.action === 'status_change' && log.details) {
      let details = log.details;
      
      // Parse details if it's a string
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
        } catch (e) {
          // If parsing fails, use as is
          return log.action;
        }
      }
      
      // Format status change with job title if available
      if (details.new_status === 'applied' && details.job_title) {
        return `Applied to job: ${details.job_title}`;
      } else if (details.new_status) {
        // Convert snake_case to Title Case
        return details.new_status
          .split('_')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    return log.action;
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Candidate History for {candidateName}</DialogTitle>
          <DialogDescription>
            Recent actions performed for this candidate
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="text-center py-6 text-muted-foreground">
            Loading history...
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto py-2">
            {logs && logs.length > 0 ? (
              logs.map((log) => {
                const formattedAction = formatLogAction(log);
                
                return (
                  <div
                    key={log.id}
                    className="p-3 rounded border mb-2 flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{formattedAction}</span>
                      {log.action === 'status_change' && log.details?.new_status && (
                        <StatusBadge status={
                          log.details.new_status === 'applied' && log.details.job_title 
                            ? `Applied to job: ${log.details.job_title}`
                            : log.details.new_status
                        } />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </span>
                    {log.details && log.action !== 'status_change' && (
                      <pre className="text-xs text-gray-500 bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No history found for this candidate.
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
