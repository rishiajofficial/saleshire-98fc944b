
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

// Form schema for assessment
const assessmentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  difficulty: z.string().optional(),
  prevent_backtracking: z.boolean().default(false),
  randomize_questions: z.boolean().default(false),
  time_limit: z.union([
    z.string().refine(val => !val || !isNaN(Number(val)), {
      message: "Time limit must be a number in minutes."
    }).transform(val => val ? Number(val) : null),
    z.number().nullable()
  ]).nullable().optional(),
});

export type AssessmentFormValues = z.infer<typeof assessmentSchema>;

interface AssessmentFormProps {
  assessmentId: string;
  initialData: AssessmentFormValues;
  onSuccess?: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessmentId,
  initialData,
  onSuccess
}) => {
  const [saving, setSaving] = useState(false);

  // Initialize form
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      difficulty: "",
      prevent_backtracking: false,
      randomize_questions: false,
      time_limit: null,
    },
  });

  const onSubmit = async (values: AssessmentFormValues) => {
    setSaving(true);
    
    try {
      // Update the assessment
      const updateData = {
        title: values.title,
        description: values.description,
        difficulty: values.difficulty,
        prevent_backtracking: values.prevent_backtracking,
        randomize_questions: values.randomize_questions,
        time_limit: values.time_limit,
      };
      
      const { error } = await supabase
        .from("assessments")
        .update(updateData)
        .eq("id", assessmentId);
      
      if (error) throw error;
      
      toast.success("Assessment updated successfully");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error updating assessment:", error.message);
      toast.error(`Failed to update assessment: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Assessment title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the assessment purpose and content" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Easy, Medium, Hard" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Limit (minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Leave empty for no time limit" 
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value === "" ? null : Number(value) || null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="prevent_backtracking"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Prevent Backtracking
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Users cannot return to previous questions
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="randomize_questions"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Randomize Questions
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Questions will appear in random order
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" /> 
              Save Changes
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AssessmentForm;
