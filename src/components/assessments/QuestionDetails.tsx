
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { X, Plus, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface QuestionFormValues {
  text: string;
  options: string[];
  correctAnswer: number;
  timeLimit?: number | null;
}

interface QuestionDetailsProps {
  sectionId: string;
  questionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<QuestionFormValues>;
}

const QuestionDetails = ({
  sectionId,
  questionId,
  onSuccess,
  onCancel,
  initialData,
}: QuestionDetailsProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!questionId;
  
  const form = useForm<QuestionFormValues>({
    defaultValues: {
      text: initialData?.text || "",
      options: initialData?.options || ["", "", "", ""],
      correctAnswer: initialData?.correctAnswer !== undefined ? initialData.correctAnswer : 0,
      timeLimit: initialData?.timeLimit || null,
    },
  });

  const addOption = () => {
    const currentOptions = form.getValues("options");
    form.setValue("options", [...currentOptions, ""]);
  };

  const removeOption = (index: number) => {
    const currentOptions = form.getValues("options");
    
    // Ensure we maintain at least 2 options
    if (currentOptions.length <= 2) {
      toast.error("A question must have at least 2 options");
      return;
    }
    
    // If removing the correct answer, reset it to the first option
    if (form.getValues("correctAnswer") === index) {
      form.setValue("correctAnswer", 0);
    } else if (form.getValues("correctAnswer") > index) {
      // If removing an option before the correct answer, adjust the index
      form.setValue("correctAnswer", form.getValues("correctAnswer") - 1);
    }
    
    form.setValue("options", currentOptions.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: QuestionFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Validate that options are not empty
      const emptyOptions = values.options.some(opt => !opt.trim());
      if (emptyOptions) {
        toast.error("All options must have content");
        setIsSubmitting(false);
        return;
      }
      
      // Ensure the correct answer is within range
      if (values.correctAnswer < 0 || values.correctAnswer >= values.options.length) {
        toast.error("Invalid correct answer selection");
        setIsSubmitting(false);
        return;
      }

      const questionData = {
        section_id: sectionId,
        text: values.text,
        options: values.options,
        correct_answer: values.correctAnswer,
        time_limit: values.timeLimit || null,
      };

      let result;
      
      if (isEditing) {
        // Update existing question
        result = await supabase
          .from("questions")
          .update({
            ...questionData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", questionId)
          .select()
          .single();
      } else {
        // Create new question
        result = await supabase
          .from("questions")
          .insert({
            ...questionData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      toast.success(`Question ${isEditing ? "updated" : "created"} successfully`);
      
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error saving question:", error.message);
      toast.error(`Failed to ${isEditing ? "update" : "create"} question: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Question" : "Add New Question"}</CardTitle>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {/* Question Text */}
            <FormField
              control={form.control}
              name="text"
              rules={{ required: "Question text is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter the question here..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Options */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <FormLabel>Answer Options</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addOption}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Option
                </Button>
              </div>
              
              {form.watch("options").map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer ${
                          form.watch("correctAnswer") === index 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-100"
                        }`}
                        onClick={() => form.setValue("correctAnswer", index)}
                      >
                        {form.watch("correctAnswer") === index && <Check className="h-4 w-4" />}
                      </div>
                      
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...form.getValues("options")];
                          newOptions[index] = e.target.value;
                          form.setValue("options", newOptions);
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <p className="text-sm text-muted-foreground">
                Click the circle to set the correct answer
              </p>
            </div>
            
            {/* Time Limit */}
            <FormField
              control={form.control}
              name="timeLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Limit (seconds)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Optional time limit in seconds" 
                      {...field} 
                      value={field.value === null ? "" : field.value}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between border-t p-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update Question" : "Add Question"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default QuestionDetails;
