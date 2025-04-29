
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface GeneratedQuestion {
  text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

interface QuestionGeneratorProps {
  assessmentId: string;
  topic?: string;
  onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
  disabled?: boolean;
}

const QuestionGenerator: React.FC<QuestionGeneratorProps> = ({ 
  assessmentId, 
  topic = "", 
  onQuestionsGenerated,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState(topic);
  const [numQuestions, setNumQuestions] = useState("5");
  const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
  
  const handleGenerate = async () => {
    if (!customTopic.trim()) {
      toast.error("Please enter a topic for question generation");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('topic, difficulty')
        .eq('id', assessmentId)
        .single();
      
      if (assessmentError) {
        throw new Error("Failed to fetch assessment details");
      }
      
      const finalTopic = customTopic || assessmentData.topic;
      const finalDifficulty = difficulty || assessmentData.difficulty;
      
      if (!finalTopic) {
        throw new Error("No topic specified for question generation");
      }

      const response = await supabase.functions.invoke("generate-assessment-questions", {
        body: { 
          topic: finalTopic, 
          difficulty: finalDifficulty, 
          numQuestions: parseInt(numQuestions, 10) 
        },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data || !response.data.questions) {
        throw new Error("Invalid response format from AI");
      }

      const generatedQuestions = response.data.questions;
      onQuestionsGenerated(generatedQuestions);
      
      toast.success(`Successfully generated ${generatedQuestions.length} questions`);
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error generating questions:", error);
      toast.error(`Failed to generate questions: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          disabled={disabled}
        >
          <Sparkles className="h-4 w-4 mr-1" /> Generate Questions
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Assessment Questions</DialogTitle>
          <DialogDescription>
            Use AI to automatically generate relevant multiple-choice questions based on your topic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="topic" className="text-sm font-medium">Topic / Concept</label>
            <Input
              id="topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g., JavaScript Basics, Marketing Fundamentals"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              The main subject for question generation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="num-questions" className="text-sm font-medium">Number of Questions</label>
              <Select
                value={numQuestions}
                onValueChange={setNumQuestions}
              >
                <SelectTrigger id="num-questions">
                  <SelectValue placeholder="5" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 Questions</SelectItem>
                  <SelectItem value="5">5 Questions</SelectItem>
                  <SelectItem value="8">8 Questions</SelectItem>
                  <SelectItem value="10">10 Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
              <Select
                value={difficulty}
                onValueChange={setDifficulty}
              >
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !customTopic.trim()}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Questions'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionGenerator;
