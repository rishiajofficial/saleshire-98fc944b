
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Plus, Trash2, MoreHorizontal } from "lucide-react";
import AddQuestion from "./AddQuestion";
import QuestionDetails from "./QuestionDetails";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer: number;
  time_limit?: number | null;
}

interface EditSectionProps {
  assessmentId: string;
  sectionId: string;
}

const EditSection = ({ assessmentId, sectionId }: EditSectionProps) => {
  const navigate = useNavigate();
  const [section, setSection] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    fetchSectionAndQuestions();
  }, [sectionId]);

  const fetchSectionAndQuestions = async () => {
    try {
      setIsLoading(true);
      
      // Fetch section details
      const { data: sectionData, error: sectionError } = await supabase
        .from("assessment_sections")
        .select("*")
        .eq("id", sectionId)
        .single();
      
      if (sectionError) throw sectionError;
      setSection(sectionData);
      
      // Fetch questions for this section
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .select("*")
        .eq("section_id", sectionId)
        .order("created_at", { ascending: true });
      
      if (questionError) throw questionError;
      
      // Parse JSON options if they come as strings
      const parsedQuestions = questionData.map((q: any) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options)
      }));
      
      setQuestions(parsedQuestions);
    } catch (error: any) {
      console.error("Error fetching section data:", error.message);
      toast.error("Failed to load section data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    
    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);
      
      if (error) throw error;
      
      toast.success("Question deleted successfully");
      fetchSectionAndQuestions(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting question:", error.message);
      toast.error(`Failed to delete question: ${error.message}`);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{section?.title || "Section Details"}</CardTitle>
          <CardDescription>{section?.description || ""}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Questions</h3>
            <Button onClick={() => setIsAddQuestionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Question
            </Button>
          </div>
          
          {questions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead>Correct Answer</TableHead>
                  <TableHead>Time Limit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">
                      {question.text.length > 50
                        ? `${question.text.substring(0, 50)}...`
                        : question.text}
                    </TableCell>
                    <TableCell>{question.options.length} options</TableCell>
                    <TableCell>Option {question.correct_answer + 1}</TableCell>
                    <TableCell>
                      {question.time_limit ? `${question.time_limit}s` : "Default"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditQuestion(question)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/10">
              <p className="text-muted-foreground mb-4">No questions added yet</p>
              <Button onClick={() => setIsAddQuestionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Your First Question
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between border-t p-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/assessments/${assessmentId}`)}
          >
            Back to Assessment
          </Button>
        </CardFooter>
      </Card>
      
      {/* Add Question Drawer */}
      <AddQuestion
        isOpen={isAddQuestionOpen}
        sectionId={sectionId}
        onOpenChange={setIsAddQuestionOpen}
        onQuestionAdded={fetchSectionAndQuestions}
      />
      
      {/* Edit Question Dialog */}
      <Dialog 
        open={!!editingQuestion} 
        onOpenChange={(open) => {
          if (!open) setEditingQuestion(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Make changes to the question
            </DialogDescription>
          </DialogHeader>
          
          {editingQuestion && (
            <QuestionDetails
              sectionId={sectionId}
              questionId={editingQuestion.id}
              initialData={{
                text: editingQuestion.text,
                options: editingQuestion.options,
                correctAnswer: editingQuestion.correct_answer,
                timeLimit: editingQuestion.time_limit,
              }}
              onSuccess={() => {
                fetchSectionAndQuestions();
                setEditingQuestion(null);
              }}
              onCancel={() => setEditingQuestion(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditSection;
