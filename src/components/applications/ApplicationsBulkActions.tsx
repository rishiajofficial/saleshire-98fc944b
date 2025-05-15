
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, XCircle, ChevronDown, Mail, Archive } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Application } from "./ApplicationsList";

interface ApplicationsBulkActionsProps {
  selectedApplications: Application[];
  onSelectionChange: () => void;
}

export const ApplicationsBulkActions = ({ 
  selectedApplications, 
  onSelectionChange 
}: ApplicationsBulkActionsProps) => {
  if (selectedApplications.length === 0) return null;

  const handleBulkStatusUpdate = async (newStatus: string) => {
    try {
      // In a real app, you would call the API to update the status
      
      toast({
        title: "Status updated",
        description: `Updated ${selectedApplications.length} applications to ${newStatus}`
      });
      
      onSelectionChange();
    } catch (error: any) {
      toast({
        variant: "destructive", 
        title: "Error updating status", 
        description: error.message
      });
    }
  };

  const handleBulkArchive = async () => {
    try {
      // In a real app, you would call the API to archive the applications
      
      toast({
        title: "Applications archived",
        description: `Archived ${selectedApplications.length} applications`
      });
      
      onSelectionChange();
    } catch (error: any) {
      toast({
        variant: "destructive", 
        title: "Error archiving applications", 
        description: error.message
      });
    }
  };

  return (
    <div className="bg-muted/40 border rounded-md p-2 flex items-center justify-between">
      <div className="text-sm">
        <span className="font-medium">{selectedApplications.length}</span> applications selected
      </div>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Update Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('hr_approved')}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Approve for Training
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('manager_interview')}>
              <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
              Schedule Interview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleBulkStatusUpdate('rejected')}>
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="outline" size="sm" onClick={handleBulkArchive}>
          <Archive className="mr-2 h-4 w-4" />
          Archive
        </Button>
        
        <Button variant="ghost" size="sm" onClick={onSelectionChange}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
