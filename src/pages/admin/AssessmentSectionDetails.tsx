
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, AlertCircle, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const AssessmentSectionDetails = () => {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<any>({
    text: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    time_limit: null
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (sectionId) {
      loadSection();
      loadQuestions();
    }
  }, [sectionId]);

  const loadSection = async () => {
    try {
      const { data, error } = await supabase
        .from("assessment_sections")
        .select(`
          *,
          assessments(*)
        `)
        .eq("id", sectionId)
        .single();

      if (error) throw error;
      setSection(data);
      setAssessment(data.assessments);
    } catch (error: any) {
      console.error("Error loading section:", error.message);
      toast.error("Failed to load section details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("section_id", sectionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error: any) {
      console.error("Error loading questions:", error.message);
      toast.error("Failed to load questions");
    }
  };

  const handleAddQuestion = async () => {
    try {
      if (!currentQuestion.text.trim()) {
        toast.error("Question text is required");
        return;
      }

      // Filter out empty options
      const filteredOptions = currentQuestion.options.filter((opt: string) => opt.trim() !== "");
      if (filteredOptions.length < 2) {
        toast.error("At least two options are required");
        return;
      }

      // Check if the correct answer index is valid
      if (currentQuestion.correct_answer >= filteredOptions.length) {
        toast.error("The correct answer must be one of the provided options");
        return;
      }

      const questionData = {
        section_id: sectionId,
        text: currentQuestion.text,
        options: filteredOptions,
        correct_answer: currentQuestion.correct_answer,
        time_limit: currentQuestion.time_limit || null
      };

      if (editingQuestionId) {
        // Update existing question
        const { error } = await supabase
          .from("questions")
          .update(questionData)
          .eq("id", editingQuestionId);

        if (error) throw error;
        toast.success("Question updated successfully");
        
        // Update the question in the local state
        setQuestions(questions.map(q => 
          q.id === editingQuestionId ? { ...q, ...questionData } : q
        ));
      } else {
        // Create new question
        const { data, error } = await supabase
          .from("questions")
          .insert(questionData)
          .select()
          .single();

        if (error) throw error;
        toast.success("Question added successfully");
        
        // Add the new question to the local state
        setQuestions([...questions, data]);
      }

      // Reset form
      setCurrentQuestion({
        text: "",
        options: ["", "", "", ""],
        correct_answer: 0,
        time_limit: null
      });
      setEditingQuestionId(null);
      setShowAddQuestionDialog(false);
    } catch (error: any) {
      console.error("Error saving question:", error.message);
      toast.error("Failed to save question");
    }
  };

  const handleEditQuestion = (question: any) => {
    setCurrentQuestion({
      text: question.text,
      options: [...question.options, ...Array(4 - question.options.length).fill("")].slice(0, 4),
      correct_answer: question.correct_answer,
      time_limit: question.time_limit
    });
    setEditingQuestionId(question.id);
    setShowAddQuestionDialog(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionId);

      if (error) throw error;
      
      setQuestions(questions.filter(q => q.id !== questionId));
      toast.success("Question deleted successfully");
    } catch (error: any) {
      console.error("Error deleting question:", error.message);
      toast.error("Failed to delete question");
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleMoveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === questions.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newQuestions = [...questions];
    const temp = newQuestions[currentIndex];
    newQuestions[currentIndex] = newQuestions[newIndex];
    newQuestions[newIndex] = temp;
    
    setQuestions(newQuestions);
    
    // Note: In a real application, you might want to update the order in the database
    // This example just updates the order in the UI
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-lg text-muted-foreground">Loading section details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!section || !assessment) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Section Not Found</h2>
          <p className="text-muted-foreground mb-6">The section you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button asChild>
            <Link to="/assessments">Go to Assessments</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{section.title}</h1>
            <p className="text-muted-foreground mt-1">
              {assessment.title} - {section.description || "No description provided"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to={`/assessments/${assessment.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessment
              </Link>
            </Button>
            <Button onClick={() => {
              setCurrentQuestion({
                text: "",
                options: ["", "", "", ""],
                correct_answer: 0,
                time_limit: null
              });
              setEditingQuestionId(null);
              setShowAddQuestionDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Add Question
            </Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="bg-muted p-8 rounded-lg text-center">
            <p className="text-lg font-medium mb-2">No Questions Yet</p>
            <p className="text-muted-foreground mb-6">
              Add questions to this section to assess candidates' knowledge
            </p>
            <Button onClick={() => {
              setCurrentQuestion({
                text: "",
                options: ["", "", "", ""],
                correct_answer: 0,
                time_limit: null
              });
              setEditingQuestionId(null);
              setShowAddQuestionDialog(true);
            }}>
              <Plus className="h-4 w-4 mr-2" /> Add Your First Question
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-xl">Question {index + 1}</CardTitle>
                        {question.time_limit && (
                          <Badge variant="outline">
                            {question.time_limit}s time limit
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMoveQuestion(question.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon"
                        variant="ghost"
                        onClick={() => handleMoveQuestion(question.id, 'down')}
                        disabled={index === questions.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </Button>
                      <Button 
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-lg">{question.text}</p>
                  <div className="space-y-3">
                    {question.options.map((option: string, optIndex: number) => (
                      <div 
                        key={optIndex}
                        className={`p-3 border rounded-md ${
                          question.correct_answer === optIndex ? 
                          "border-green-500 bg-green-50" : 
                          "border-gray-200"
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${
                            question.correct_answer === optIndex ?
                            "bg-green-500 text-white" :
                            "bg-gray-200"
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </div>
                          <div>{option}</div>
                          {question.correct_answer === optIndex && (
                            <Badge className="ml-2 bg-green-500">Correct Answer</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Question Dialog */}
        <Dialog open={showAddQuestionDialog} onOpenChange={setShowAddQuestionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingQuestionId ? "Edit Question" : "Add New Question"}</DialogTitle>
              <DialogDescription>
                {editingQuestionId ? "Modify the existing question" : "Create a new question for this section"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label htmlFor="question-text" className="text-sm font-medium">
                  Question Text *
                </label>
                <Textarea
                  id="question-text"
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                  placeholder="Enter your question here"
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Answer Options *</h4>
                {currentQuestion.options.map((option: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 flex items-center justify-center bg-muted rounded-full">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`correct-${index}`}
                        name="correct-answer"
                        checked={currentQuestion.correct_answer === index}
                        onChange={() => setCurrentQuestion({ ...currentQuestion, correct_answer: index })}
                      />
                      <label htmlFor={`correct-${index}`} className="text-sm">
                        Correct
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="time-limit" className="text-sm font-medium">
                    Time Limit (seconds)
                  </label>
                  <Switch
                    id="enable-time-limit"
                    checked={currentQuestion.time_limit !== null}
                    onCheckedChange={(checked) => 
                      setCurrentQuestion({ 
                        ...currentQuestion, 
                        time_limit: checked ? 30 : null 
                      })
                    }
                  />
                </div>
                {currentQuestion.time_limit !== null && (
                  <Input
                    id="time-limit"
                    type="number"
                    min="5"
                    value={currentQuestion.time_limit || ""}
                    onChange={(e) => setCurrentQuestion({ 
                      ...currentQuestion, 
                      time_limit: parseInt(e.target.value) || null 
                    })}
                    placeholder="Time limit in seconds"
                  />
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddQuestionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddQuestion}>
                {editingQuestionId ? "Update Question" : "Add Question"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AssessmentSectionDetails;
