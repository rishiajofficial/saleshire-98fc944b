
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
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded border mb-2 flex flex-col gap-0.5"
                >
                  <span className="font-medium text-gray-800">{log.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                  {log.details && (
                    <pre className="text-xs text-gray-500 bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  )}
                </div>
              ))
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
