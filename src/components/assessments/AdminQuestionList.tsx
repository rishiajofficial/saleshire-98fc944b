
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: string;
  text: string;
  options: string[];
  scores: number[];
  correct_answer: number;
  time_limit: number | null;
}

type Props = {
  assessmentId: string;
};

const blankQuestion = (assessmentId: string): Omit<Question, "id"> => ({
  text: "",
  options: ["", ""],
  scores: [1, 1],
  correct_answer: 0,
  time_limit: null,
});

const AdminQuestionList: React.FC<Props> = ({ assessmentId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<Partial<Question> | null>(null);
  const [adding, setAdding] = useState(false);
  const [addState, setAddState] = useState<Omit<Question, "id"> | null>(null);

  // Fetch questions (flat)
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        const mapped: Question[] = data.map((q: any) => ({
          ...q,
          options: Array.isArray(q.options) ? q.options : [],
          scores: Array.isArray(q.scores) ? q.scores : (q.options ? q.options.map(() => 1) : []),
        }));
        setQuestions(mapped);
      }
      setLoading(false);
    };
    if (assessmentId) fetchQuestions();
  }, [assessmentId, adding]);

  // Handle add/edit/delete
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

  const handleEditOptionAdd = () => {
    setEditState((prev) => {
      if (!prev || !prev.options || !prev.scores) return prev;
      return {
        ...prev,
        options: [...prev.options, ""],
        scores: [...prev.scores, 1],
      };
    });
  };

  const handleEditOptionRemove = (i: number) => {
    setEditState((prev) => {
      if (!prev || !prev.options || !prev.scores) return prev;
      return {
        ...prev,
        options: prev.options.filter((_, idx) => idx !== i),
        scores: prev.scores.filter((_, idx) => idx !== i),
      };
    });
  };

  const saveEdit = async () => {
    if (!editState || !editingId) return;
    const { text, options, scores, correct_answer, time_limit } = editState;
    await supabase
      .from("questions")
      .update({
        text,
        options,
        scores,
        correct_answer,
        time_limit: time_limit ?? null,
      })
      .eq("id", editingId);
    setEditingId(null);
    setEditState(null);
    setLoading(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await supabase.from("questions").delete().eq("id", id);
      setLoading(true);
    }
  };

  const startAdd = () => {
    setAddState(blankQuestion(assessmentId));
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
  const handleAddOptionAdd = () => {
    setAddState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        options: [...prev.options, ""],
        scores: [...prev.scores, 1],
      };
    });
  };
  const handleAddOptionRemove = (i: number) => {
    setAddState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        options: prev.options.filter((_, idx) => idx !== i),
        scores: prev.scores.filter((_, idx) => idx !== i),
      };
    });
  };

  const saveAdd = async () => {
    if (!addState) return;
    const { text, options, scores, correct_answer, time_limit } = addState;
    await supabase.from("questions").insert({
      assessment_id: assessmentId,
      text,
      options,
      scores,
      correct_answer,
      time_limit: time_limit ?? null,
    });
    setAdding(false);
    setAddState(null);
    setLoading(true);
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">Questions</h2>
      <Button variant="outline" onClick={startAdd} className="mb-6">
        <Plus className="h-4 w-4 mr-2" /> Add Question
      </Button>
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
          <div>
            {addState.options.map((option, i) => (
              <div key={i} className="flex items-center mb-2 gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleAddOption(i, e.target.value)}
                  className="flex-grow"
                  placeholder={`Option ${i + 1}`}
                  required
                />
                <Input
                  type="number"
                  value={addState.scores[i] ?? 1}
                  min={0}
                  onChange={(e) => handleAddScore(i, Number(e.target.value))}
                  className="w-20"
                  placeholder="Score"
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
                <div>
                  {editState.options?.map((opt, idx) => (
                    <div key={idx} className="flex items-center mb-2 gap-2">
                      <Input
                        value={opt}
                        onChange={(e) =>
                          handleEditOption(idx, e.target.value)
                        }
                        className="flex-grow"
                        placeholder={`Option ${idx + 1}`}
                      />
                      <Input
                        type="number"
                        value={editState.scores?.[idx] ?? 1}
                        min={0}
                        onChange={(e) =>
                          handleEditScore(idx, Number(e.target.value))
                        }
                        className="w-20"
                        placeholder="Score"
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
                        <span className="text-xs ml-3">Score: <span className="font-mono">{q.scores?.[i] ?? 1}</span></span>
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
