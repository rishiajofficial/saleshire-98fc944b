
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Check, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import QuestionGenerator from "./QuestionGenerator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  text: string;
  options: string[];
  scores: number[];
  correct_answer: number;
  time_limit: number | null;
}

interface GeneratedQuestion {
  text: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

type Props = {
  assessmentId: string;
};

const AdminQuestionList: React.FC<Props> = ({ assessmentId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Question | null>(null);
  const [adding, setAdding] = useState(false);
  const [addState, setAddState] = useState<Omit<Question, "id"> | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [assessmentTopic, setAssessmentTopic] = useState<string>("");

  useEffect(() => {
    const fetchAssessment = async () => {
      if (assessmentId) {
        try {
          const { data, error } = await supabase
            .from("assessments")
            .select("topic")
            .eq("id", assessmentId)
            .single();
          
          if (error) throw error;
          if (data && data.topic) {
            setAssessmentTopic(data.topic);
          }
        } catch (error) {
          console.error("Error fetching assessment topic:", error);
        }
      }
    };
    
    fetchAssessment();
  }, [assessmentId]);

  useEffect(() => {
    const fetchOrCreateSection = async () => {
      const { data: existingSections, error: fetchError } = await supabase
        .from("assessment_sections")
        .select("id")
        .eq("assessment_id", assessmentId)
        .limit(1);

      if (fetchError) {
        console.error("Error fetching sections:", fetchError);
        return;
      }

      if (existingSections && existingSections.length > 0) {
        setSectionId(existingSections[0].id);
        return;
      }

      const { data: newSection, error: createError } = await supabase
        .from("assessment_sections")
        .insert({
          assessment_id: assessmentId,
          title: "Default Section",
          description: "Questions for this assessment",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating default section:", createError);
        toast.error("Failed to create a default section for questions");
        return;
      }

      if (newSection) {
        setSectionId(newSection.id);
      }
    };

    if (assessmentId) {
      fetchOrCreateSection();
    }
  }, [assessmentId]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!sectionId) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("section_id", sectionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching questions:", error);
        toast.error("Failed to load questions");
        setLoading(false);
        return;
      }

      if (data) {
        const mapped: Question[] = data.map((q: any) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
          scores: Array.isArray(q.scores) ? q.scores : (q.options ? q.options.map((_, i) => i === q.correct_answer ? 1 : 0) : []),
        }));
        setQuestions(mapped);
      }
      setLoading(false);
    };
    
    if (sectionId) fetchQuestions();
  }, [sectionId, adding, editingId]);

  const blankQuestion = (): Omit<Question, "id"> => ({
    text: "",
    options: ["", ""],
    scores: [1, 0],
    correct_answer: 0,
    time_limit: null,
  });

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setEditState({ ...q });
  };

  const handleEditChange = (key: keyof Question, value: any) => {
    setEditState((prev) =>
      prev ? { ...prev, [key]: value } : prev
    );
  };

  const handleEditOption = (i: number, value: string) => {
    setEditState((prev) => {
      if (!prev || !prev.options) return prev;
      const options = [...prev.options];
      options[i] = value;
      return { ...prev, options };
    });
  };

  const handleEditScore = (i: number, value: number) => {
    setEditState((prev) => {
      if (!prev || !prev.scores) return prev;
      const scores = [...prev.scores];
      scores[i] = value;
      return { ...prev, scores };
    });
  };

  const handleEditCorrectAnswer = (index: number) => {
    setEditState((prev) => {
      if (!prev) return prev;
      // Update scores to reflect the correct answer
      const scores = prev.options.map((_, i) => i === index ? 1 : 0);
      return {
        ...prev,
        correct_answer: index,
        scores
      };
    });
  };

  const handleEditOptionAdd = () => {
    setEditState((prev) => {
      if (!prev || !prev.options || !prev.scores) return prev;
      return {
        ...prev,
        options: [...prev.options, ""],
        scores: [...prev.scores, 0], // Default new option to not correct
      };
    });
  };

  const handleEditOptionRemove = (i: number) => {
    setEditState((prev) => {
      if (!prev || !prev.options || !prev.scores) return prev;
      
      // Create new arrays without the removed option
      const newOptions = prev.options.filter((_, idx) => idx !== i);
      const newScores = prev.scores.filter((_, idx) => idx !== i);
      
      // Adjust correct_answer if needed
      let newCorrectAnswer = prev.correct_answer;
      if (i === prev.correct_answer) {
        // If removed option was the correct one, default to first option
        newCorrectAnswer = 0;
        // Update scores to reflect this
        newScores[0] = 1;
      } else if (i < prev.correct_answer) {
        // If removed option was before the correct one, adjust index
        newCorrectAnswer = prev.correct_answer - 1;
      }
      
      return {
        ...prev,
        options: newOptions,
        scores: newScores,
        correct_answer: newCorrectAnswer
      };
    });
  };

  const saveEdit = async () => {
    if (!editState || !editingId || !sectionId) return;
    const { text, options, scores, correct_answer } = editState;
    
    try {
      const { error } = await supabase
        .from("questions")
        .update({
          text,
          options,
          scores,
          correct_answer,
          section_id: sectionId
        })
        .eq("id", editingId);
        
      if (error) throw error;
      toast.success("Question updated successfully");
    } catch (error: any) {
      console.error("Error updating question:", error);
      toast.error(`Failed to update question: ${error.message}`);
    } finally {
      setEditingId(null);
      setEditState(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const { error } = await supabase.from("questions").delete().eq("id", id);
        if (error) throw error;
        toast.success("Question deleted successfully");
        
        setQuestions(questions.filter(q => q.id !== id));
      } catch (error: any) {
        console.error("Error deleting question:", error);
        toast.error(`Failed to delete question: ${error.message}`);
      }
    }
  };

  const startAdd = () => {
    setAddState(blankQuestion());
    setAdding(true);
  };
  
  const cancelAdd = () => {
    setAddState(null);
    setAdding(false);
  };

  const handleAddChange = (key: keyof Omit<Question, "id">, value: any) => {
    setAddState((prev) =>
      prev ? { ...prev, [key]: value } : prev
    );
  };
  
  const handleAddOption = (i: number, value: string) => {
    setAddState((prev) => {
      if (!prev) return prev;
      const options = [...prev.options];
      options[i] = value;
      return { ...prev, options };
    });
  };
  
  const handleAddScore = (i: number, value: number) => {
    setAddState((prev) => {
      if (!prev) return prev;
      const scores = [...prev.scores];
      scores[i] = value;
      return { ...prev, scores };
    });
  };
  
  const handleAddCorrectAnswer = (index: number) => {
    setAddState((prev) => {
      if (!prev) return prev;
      // Update scores based on correct answer
      const scores = prev.options.map((_, i) => i === index ? 1 : 0);
      return {
        ...prev,
        correct_answer: index,
        scores
      };
    });
  };
  
  const handleAddOptionAdd = () => {
    setAddState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        options: [...prev.options, ""],
        scores: [...prev.scores, 0], // Default score of 0 for new options
      };
    });
  };
  
  const handleAddOptionRemove = (i: number) => {
    setAddState((prev) => {
      if (!prev) return prev;
      
      // Create new arrays without the removed option
      const newOptions = prev.options.filter((_, idx) => idx !== i);
      const newScores = prev.scores.filter((_, idx) => idx !== i);
      
      // Adjust correct_answer if needed
      let newCorrectAnswer = prev.correct_answer;
      if (i === prev.correct_answer) {
        // If removed option was the correct one, default to first option
        newCorrectAnswer = 0;
        // Update scores to reflect this
        if (newScores.length > 0) {
          newScores[0] = 1;
        }
      } else if (i < prev.correct_answer) {
        // If removed option was before the correct one, adjust index
        newCorrectAnswer = prev.correct_answer - 1;
      }
      
      return {
        ...prev,
        options: newOptions,
        scores: newScores,
        correct_answer: newCorrectAnswer
      };
    });
  };

  const saveAdd = async () => {
    if (!addState || !sectionId) {
      toast.error("Cannot add question: No section available");
      return;
    }
    
    const { text, options, scores, correct_answer } = addState;
    
    try {
      const { error } = await supabase.from("questions").insert({
        section_id: sectionId,
        text,
        options,
        scores,
        correct_answer,
        time_limit: null
      });
      
      if (error) throw error;
      toast.success("Question added successfully");
      setAdding(false);
      setAddState(null);
    } catch (error: any) {
      console.error("Error adding question:", error);
      toast.error(`Failed to add question: ${error.message}`);
    }
  };

  const handleQuestionsGenerated = async (generatedQuestions: GeneratedQuestion[]) => {
    if (!sectionId) {
      toast.error("Cannot add questions: No section available");
      return;
    }

    try {
      // Prepare questions for batch insert
      const questionsToInsert = generatedQuestions.map(q => ({
        section_id: sectionId,
        text: q.text,
        options: q.options,
        scores: q.options.map((_, i) => i === q.correct_answer ? 1 : 0), // Set 1 for correct answer, 0 for all others
        correct_answer: q.correct_answer,
        time_limit: null
      }));

      // Insert all questions in a batch
      const { data, error } = await supabase
        .from("questions")
        .insert(questionsToInsert)
        .select();

      if (error) throw error;
      
      toast.success(`Successfully added ${questionsToInsert.length} new questions`);
      
      // Refresh questions list
      const { data: updatedQuestions, error: fetchError } = await supabase
        .from("questions")
        .select("*")
        .eq("section_id", sectionId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      if (updatedQuestions) {
        const mapped: Question[] = updatedQuestions.map((q: any) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
          scores: Array.isArray(q.scores) ? q.scores : (q.options ? q.options.map((_, i) => i === q.correct_answer ? 1 : 0) : []),
        }));
        setQuestions(mapped);
      }
    } catch (error: any) {
      console.error("Error adding generated questions:", error);
      toast.error(`Failed to add questions: ${error.message}`);
    }
  };

  if (!sectionId && !loading) {
    return <div className="text-center p-4">Unable to load or create section for questions</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Questions</h2>
        <div className="flex gap-2">
          <QuestionGenerator 
            assessmentId={assessmentId}
            topic={assessmentTopic}
            onQuestionsGenerated={handleQuestionsGenerated}
          />
          <Button variant="outline" onClick={startAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add Question
          </Button>
        </div>
      </div>
      
      {adding && addState && (
        <div className="border rounded p-4 mb-6 bg-gray-50">
          <div className="mb-2">
            <Textarea
              value={addState.text}
              placeholder="Enter question text"
              onChange={(e) => handleAddChange("text", e.target.value)}
              className="w-full mb-2"
              required
            />
          </div>
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Select the correct answer:</div>
            <RadioGroup 
              value={addState.correct_answer.toString()} 
              onValueChange={(value) => handleAddCorrectAnswer(parseInt(value))}
            >
              {addState.options.map((option, i) => (
                <div key={i} className="flex items-center mb-2 gap-2">
                  <RadioGroupItem value={i.toString()} id={`add-option-${i}`} />
                  <Input
                    value={option}
                    onChange={(e) => handleAddOption(i, e.target.value)}
                    className="flex-grow"
                    placeholder={`Option ${i + 1}`}
                    required
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => handleAddOptionRemove(i)}
                    disabled={addState.options.length <= 2}
                    title="Remove Option"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </RadioGroup>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleAddOptionAdd}
              className="mt-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Option
            </Button>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={saveAdd} size="sm">
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button onClick={cancelAdd} size="sm" variant="outline">
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading questions...</div>
      ) : (
        <div className="space-y-4">
          {questions.length === 0 && (
            <div className="p-3 rounded bg-slate-50 text-center text-muted-foreground">
              No questions added yet.
            </div>
          )}
          {questions.map((q) =>
            editingId === q.id && editState ? (
              <div key={q.id} className="border rounded p-4 bg-gray-50">
                <div className="mb-2">
                  <Textarea
                    value={editState.text ?? ""}
                    onChange={(e) =>
                      handleEditChange("text", e.target.value)
                    }
                    className="w-full mb-2"
                  />
                </div>
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Select the correct answer:</div>
                  <RadioGroup 
                    value={editState.correct_answer.toString()} 
                    onValueChange={(value) => handleEditCorrectAnswer(parseInt(value))}
                  >
                    {editState.options?.map((opt, idx) => (
                      <div key={idx} className="flex items-center mb-2 gap-2">
                        <RadioGroupItem value={idx.toString()} id={`edit-option-${idx}`} />
                        <Input
                          value={opt}
                          onChange={(e) =>
                            handleEditOption(idx, e.target.value)
                          }
                          className="flex-grow"
                          placeholder={`Option ${idx + 1}`}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          onClick={() => handleEditOptionRemove(idx)}
                          disabled={
                            (editState.options?.length ?? 0) <= 2
                          }
                          title="Remove Option"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </RadioGroup>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={handleEditOptionAdd}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Option
                  </Button>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={saveEdit} size="sm">
                    <Check className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button
                    onClick={cancelEdit}
                    size="sm"
                    variant="outline"
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key={q.id}
                className="border rounded p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <div className="font-medium">{q.text}</div>
                  <ul className="mt-2 text-sm text-muted-foreground">
                    {q.options.map((option, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span>
                          {option}
                          {q.correct_answer === i && (
                            <span className="ml-2 font-bold text-green-600">
                              (Correct)
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2 justify-end md:mt-0 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(q)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default AdminQuestionList;
