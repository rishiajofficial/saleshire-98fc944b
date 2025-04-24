
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type ManagerProfile = Pick<Tables<'profiles'>, 'id' | 'name'>;

interface ManagerAssignmentProps {
  selectedManager: string;
  managers?: ManagerProfile[];
  isLoadingManagers: boolean;
  isAssigningManager: boolean;
  candidateAssignedManager?: string | null;
  onManagerSelect: (managerId: string) => void;
  onAssignManager: () => void;
}

export const ManagerAssignment = ({
  selectedManager,
  managers,
  isLoadingManagers,
  isAssigningManager,
  candidateAssignedManager,
  onManagerSelect,
  onAssignManager
}: ManagerAssignmentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manager Assignment</CardTitle>
        <CardDescription>
          Assign a Sales Manager to this candidate.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Assign Manager</Label>
          <Select 
            value={selectedManager} 
            onValueChange={onManagerSelect}
            disabled={isLoadingManagers || isAssigningManager}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a manager..." />
            </SelectTrigger>
            <SelectContent>
              {isLoadingManagers ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : ( 
                managers?.map((manager) => (
                  <SelectItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button 
            onClick={onAssignManager} 
            disabled={!selectedManager || isAssigningManager || candidateAssignedManager === selectedManager}
            className="mt-6"
          >
            {isAssigningManager ? "Assigning..." : "Assign Manager"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
