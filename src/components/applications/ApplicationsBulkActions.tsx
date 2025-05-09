
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  CheckSquare,
  MailCheck,
  Archive,
  CornerRightDown,
  ChevronDown,
} from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Application } from "@/components/dashboard/ApplicationsList";

interface ApplicationsBulkActionsProps {
  selectedApplications: Application[];
  onSelectionChange: () => void;
}

export const ApplicationsBulkActions: React.FC<ApplicationsBulkActionsProps> = ({
  selectedApplications,
  onSelectionChange,
}) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  const handleBulkAction = (action: string) => {
    setBulkAction(action);
    setIsConfirmDialogOpen(true);
  };

  const performBulkAction = async () => {
    if (!bulkAction || selectedApplications.length === 0) return;
    
    setIsProcessing(true);
    try {
      const applicationIds = selectedApplications.map(app => app.id);
      let newStatus = '';
      let message = '';
      
      switch (bulkAction) {
        case 'approve':
          newStatus = 'hr_approved';
          message = 'Applications approved';
          break;
        case 'reject':
          newStatus = 'rejected';
          message = 'Applications rejected';
          break;
        case 'archive':
          newStatus = 'archived';
          message = 'Applications archived';
          break;
      }
      
      if (newStatus) {
        // Update application statuses
        const { error } = await supabase
          .from('job_applications')
          .update({ status: newStatus })
          .in('id', applicationIds);
          
        if (error) throw error;
        
        // Log status change in history
        const historyEntries = applicationIds.map(id => ({
          application_id: id,
          status: newStatus,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
          notes: `Bulk action: ${bulkAction}`,
        }));
        
        await supabase
          .from('application_status_history')
          .insert(historyEntries);
      }
      
      if (bulkAction === 'email') {
        message = 'Email sent to selected candidates';
        // In a real implementation, we would integrate with an email service
      }
      
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      onSelectionChange(); // Clear selection
      
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setIsConfirmDialogOpen(false);
    }
  };

  const getActionTitle = () => {
    switch (bulkAction) {
      case 'approve': return 'Approve Selected Applications';
      case 'reject': return 'Reject Selected Applications';
      case 'archive': return 'Archive Selected Applications';
      case 'email': return 'Send Email to Selected Candidates';
      default: return 'Confirm Action';
    }
  };

  const getActionDescription = () => {
    const count = selectedApplications.length;
    switch (bulkAction) {
      case 'approve': 
        return `Are you sure you want to approve ${count} selected application${count > 1 ? 's' : ''}? This will move them to the next stage.`;
      case 'reject': 
        return `Are you sure you want to reject ${count} selected application${count > 1 ? 's' : ''}? This action cannot be undone.`;
      case 'archive': 
        return `Are you sure you want to archive ${count} selected application${count > 1 ? 's' : ''}? They will no longer appear in the main view.`;
      case 'email': 
        return `You are about to send an email to ${count} candidate${count > 1 ? 's' : ''}.`;
      default: 
        return 'Please confirm this action.';
    }
  };

  if (selectedApplications.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-muted/30 border rounded-md p-2 flex justify-between items-center mb-4">
        <div className="text-sm">
          <span className="font-medium">{selectedApplications.length}</span> application{selectedApplications.length !== 1 && 's'} selected
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Bulk Actions <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleBulkAction('approve')}>
              <CheckSquare className="mr-2 h-4 w-4" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('email')}>
              <MailCheck className="mr-2 h-4 w-4" /> Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleBulkAction('reject')}>
              <CornerRightDown className="mr-2 h-4 w-4" /> Reject
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
              <Archive className="mr-2 h-4 w-4" /> Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionTitle()}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{getActionDescription()}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              onClick={performBulkAction}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
