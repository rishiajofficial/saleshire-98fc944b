
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface JobApplicationsDialogProps {
  jobId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const JobApplicationsDialog: React.FC<JobApplicationsDialogProps> = ({
  jobId,
  isOpen,
  onClose,
}) => {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['jobApplications', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          candidates:candidates (
            id,
            profile:profiles!candidates_id_fkey (
              name,
              email
            )
          )
        `)
        .eq('job_id', jobId);

      if (error) throw error;
      return data;
    },
    enabled: isOpen
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Job Applications</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !applications?.length ? (
          <p className="text-center text-muted-foreground py-4">
            No applications found for this job.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>{application.candidates?.profile?.name || "N/A"}</TableCell>
                  <TableCell>{application.candidates?.profile?.email || "N/A"}</TableCell>
                  <TableCell className="capitalize">{application.status}</TableCell>
                  <TableCell>
                    {new Date(application.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};
