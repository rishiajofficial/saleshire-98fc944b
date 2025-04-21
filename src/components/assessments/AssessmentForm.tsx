
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContentService from "@/services/contentService";

// Simplified schema without time_limit, prevent_backtracking, and randomize_questions fields
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  difficulty: z.string().optional(),
});

export type AssessmentFormValues = z.infer<typeof formSchema>;

interface AssessmentFormProps {
  assessmentId: string;
  initialData: AssessmentFormValues;
  onSuccess?: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  assessmentId,
  initialData,
  onSuccess,
}) => {
  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: AssessmentFormValues) => {
    try {
      // Update the assessment
      const response = await ContentService.updateContent('assessment', assessmentId, data);

      if (!response.success) {
        throw new Error(response.error);
      }
      
      toast.success("Assessment updated successfully");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating assessment:", error);
      toast.error("Failed to update assessment");
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
                  placeholder="Description of what this assessment covers"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty Level</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
};

export default AssessmentForm;
