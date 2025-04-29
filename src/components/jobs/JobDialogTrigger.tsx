
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, PencilLine, Eye } from "lucide-react";

interface JobDialogTriggerProps {
  mode: "create" | "edit" | "view";
  onClick: () => void;
}

const JobDialogTrigger: React.FC<JobDialogTriggerProps> = ({ mode, onClick }) => {
  switch (mode) {
    case "edit":
      return (
        <Button variant="outline" size="sm" onClick={onClick}>
          <PencilLine className="w-4 h-4 mr-1" /> Edit
        </Button>
      );
    case "view":
      return (
        <Button variant="ghost" size="sm" onClick={onClick}>
          <Eye className="w-4 h-4 mr-1" /> View
        </Button>
      );
    default:
      return (
        <Button onClick={onClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Job
        </Button>
      );
  }
};

export default JobDialogTrigger;
