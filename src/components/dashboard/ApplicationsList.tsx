import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ChevronDown,
  BarChart2,
  CheckSquare,
  ExternalLink,
} from "lucide-react";
import { Application } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApplicationStatusHistory } from "@/components/applications/ApplicationStatusHistory";
import { toast } from "sonner";

interface ApplicationsListProps {
  applications: Application[];
  isLoading: boolean;
  error?: Error | null;
  userRole?: string;
  userId?: string;
  onStatusUpdate?: (applicationIds: string[], newStatus: string, notes?: string) => void;
}

export const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  isLoading,
  error,
  userRole,
  userId,
  onStatusUpdate,
}) => {
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');

  const handleCheckboxChange = (applicationId: string) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map((app) => app.id));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedApplications.length === 0) {
      alert('Please select a status and at least one application.');
      return;
    }

    setIsBulkUpdating(true);
    try {
      await onStatusUpdate(selectedApplications, bulkStatus, notes);
      toast.success(`${selectedApplications.length} applications updated to ${bulkStatus}`);
      setSelectedApplications([]);
      setBulkStatus('');
      setNotes('');
    } catch (err: any) {
      toast.error(`Failed to update applications: ${err.message}`);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-gray-100 text-gray-700";
      case "hr_review":
        return "bg-blue-100 text-blue-700";
      case "hr_approved":
        return "bg-green-100 text-green-700";
      case "training":
        return "bg-purple-100 text-purple-700";
      case "manager_interview":
        return "bg-yellow-100 text-yellow-700";
      case "sales_task":
        return "bg-orange-100 text-orange-700";
      case "hired":
        return "bg-emerald-100 text-emerald-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-8">
          Loading applications...
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-8 text-red-600">
          Error: {error.message}
        </TableCell>
      </TableRow>
    );
  }

  if (applications.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center py-8">
          <p className="text-muted-foreground">No applications found.</p>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {selectedApplications.length > 0 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedApplications.length} applications selected
            </div>
            <div className="flex items-center gap-2">
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                <option value="">Select Status</option>
                <option value="applied">Applied</option>
                <option value="hr_review">HR Review</option>
                <option value="hr_approved">HR Approved</option>
                <option value="training">Training</option>
                <option value="manager_interview">Interview</option>
                <option value="sales_task">Sales Task</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="text"
                placeholder="Add notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="px-4 py-2 border rounded-md text-sm"
              />
              <Button
                size="sm"
                onClick={handleBulkUpdate}
                disabled={isBulkUpdating || !bulkStatus}
              >
                {isBulkUpdating ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedApplications.length === applications.length && applications.length > 0}
                aria-label="Select all"
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Candidate</TableHead>
            <TableHead>Job</TableHead>
            <TableHead className="hidden md:table-cell">Department</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="w-[50px]">
                <Checkbox
                  checked={selectedApplications.includes(application.id)}
                  onCheckedChange={() => handleCheckboxChange(application.id)}
                />
              </TableCell>
              <TableCell>
                {application.candidate_name && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <span className="cursor-help underline decoration-dashed underline-offset-2">
                        {application.candidate_name}
                      </span>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <div>
                        <p className="font-medium">{application.candidate_name}</p>
                        <p className="text-xs text-muted-foreground">{application.candidate_email}</p>
                        <p className="text-xs text-muted-foreground">Candidate ID: {application.candidate_id}</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}
              </TableCell>
              <TableCell>
                {application.job_title}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {application.job_department || "N/A"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {application.job_location || "N/A"}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(application.status)}>
                  {application.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setShowHistory(application.id)}>
                      View Status History
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <a href={`/manager/job-application/${application.id}`} target="_blank" rel="noopener noreferrer">
                        View Application <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!showHistory} onOpenChange={() => setShowHistory(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Status History</DialogTitle>
            <DialogDescription>
              Track the status changes for this application.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full">
            {showHistory && (
              <ApplicationStatusHistory applicationId={showHistory} />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApplicationsList;
export type { Application };
