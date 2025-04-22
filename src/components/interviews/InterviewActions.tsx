
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, Archive, X } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface InterviewActionsProps {
  interviewId: string;
  onArchive?: () => void;
  onCancel?: () => void;
}

export const InterviewActions = ({ interviewId, onArchive, onCancel }: InterviewActionsProps) => {
  const { toast } = useToast();

  const handleArchive = async () => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ archived: true })
        .eq('id', interviewId);

      if (error) throw error;
      toast({
        title: "Interview archived",
        description: "The interview has been archived successfully.",
      });
      if (onArchive) onArchive();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleCancel = async () => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ status: 'cancelled' })
        .eq('id', interviewId);

      if (error) throw error;
      toast({
        title: "Interview cancelled",
        description: "The interview has been cancelled successfully.",
      });
      if (onCancel) onCancel();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleArchive}
        className="h-8 w-8"
        title="Archive Interview"
      >
        <Archive className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="h-8 w-8"
        title="View Details"
      >
        <Link to={`/interviews/${interviewId}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
        title="Cancel Interview"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
