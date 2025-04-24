
import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useTrainingStore } from './useTrainingStore';

export const useQuiz = (questions: any[], moduleId: string) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const { submitQuizResults } = useTrainingStore(moduleId);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleAnswerChange = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleSubmitAnswer = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      setIsSubmitting(true);
      const currentQuestion = questions[currentQuestionIndex];
      
      if (selectedAnswer) {
        setAnswers(prev => ({
          ...prev,
          [currentQuestionIndex]: selectedAnswer
        }));
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeRemaining(30);
        startTimer();
      } else {
        await finalizeQuiz();
      }
    } catch (error) {
      toast.error("Error submitting answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizeQuiz = async () => {
    const totalQuestions = questions.length;
    const correctAnswers = Object.entries(answers).reduce((acc, [index, answer]) => {
      const question = questions[Number(index)];
      const answerIndex = question.options.indexOf(answer);
      return acc + (String.fromCharCode(65 + answerIndex) === question.correctAnswer ? 1 : 0);
    }, 0);

    const finalScore = Math.round((correctAnswers / totalQuestions) * 100);
    setScore(finalScore);

    await submitQuizResults({
      score: finalScore,
      total_questions: totalQuestions,
      passed: finalScore >= 70,
      answers
    });

    setQuizCompleted(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setQuizCompleted(false);
    setTimeRemaining(30);
    startTimer();
  };

  return {
    currentQuestionIndex,
    selectedAnswer,
    answers,
    isSubmitting,
    quizCompleted,
    score,
    timeRemaining,
    handleAnswerChange,
    handleSubmitAnswer,
    resetQuiz,
    startTimer
  };
};
