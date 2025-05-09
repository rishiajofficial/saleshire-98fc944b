
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarRange } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

type ManagerProfile = Pick<Tables<'profiles'>, 'id' | 'name'>;

interface InterviewSchedulingProps {
  isManager?: boolean;
  interviewAction: 'create' | 'update' | 'cancel';
  interviewManagerId: string;
  interviewScheduledAt: Date | undefined;
  interviewStatus: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  interviewNotes: string;
  isManagingInterview: boolean;
  managers?: ManagerProfile[];
  isLoadingManagers?: boolean;
  onActionChange: (value: 'create' | 'update' | 'cancel') => void;
  onManagerChange: (managerId: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onStatusChange: (status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled') => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
}

export const InterviewScheduling = ({
  isManager = false,
  interviewAction,
  interviewManagerId,
  interviewScheduledAt,
  interviewStatus,
  interviewNotes,
  isManagingInterview,
  managers,
  isLoadingManagers,
  onActionChange,
  onManagerChange,
  onDateChange,
  onStatusChange,
  onNotesChange,
  onSubmit
}: InterviewSchedulingProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isManager ? "Schedule Final Interview" : "Schedule Interview"}</CardTitle>
        <CardDescription>
          {isManager ? "Schedule or update the final interview for the candidate." : "Schedule or update an interview for the candidate"}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Action</Label>
            <Select 
              value={interviewAction} 
              onValueChange={onActionChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="cancel">Cancel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isManager ? (
            <div>
              <Label>Manager ID (Your ID)</Label>
              <Input 
                type="text" 
                value={interviewManagerId} 
                readOnly 
                className="bg-muted/50" 
              />
            </div>
          ) : (
            <div>
              <Label>Manager</Label>
              <Select 
                value={interviewManagerId || "default"} 
                onValueChange={onManagerChange}
                disabled={isLoadingManagers || isManagingInterview}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select interviewing manager..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingManagers ? (
                    <SelectItem value="loading" disabled>Loading managers...</SelectItem>
                  ) : ( 
                    managers?.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))
                  )}
                  {!isLoadingManagers && (!managers || managers.length === 0) && (
                    <SelectItem value="default" disabled>No managers available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Scheduled At</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !interviewScheduledAt && "text-muted-foreground"
                  )}
                >
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {interviewScheduledAt ? (
                    format(interviewScheduledAt, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={interviewScheduledAt}
                  onSelect={onDateChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Status</Label>
            <Select 
              value={interviewStatus} 
              onValueChange={onStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea 
              value={interviewNotes} 
              onChange={(e) => onNotesChange(e.target.value)} 
              placeholder="Add interview notes or instructions for the candidate"
            />
          </div>

          <div>
            <Button 
              onClick={onSubmit} 
              disabled={isManagingInterview}
            >
              {isManagingInterview ? "Managing..." : "Manage Interview"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
