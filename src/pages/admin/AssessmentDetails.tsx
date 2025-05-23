import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/ui/loading";
import ErrorMessage from "@/components/ui/error-message";
import AssessmentForm, { AssessmentFormValues } from "@/components/assessments/AssessmentForm";
import AdminQuestionList from "@/components/assessments/AdminQuestionList";

const AssessmentDetails = () => {
  const { assessmentId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AssessmentFormValues | null>(null);

  // Load assessment data
  useEffect(() => {
    const loadAssessment = async () => {
      setLoading(true);
      setLoadingError(null);

      try {
        if (!assessmentId) {
          setLoadingError("Assessment ID is missing");
          return;
        }

        // Fetch assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();

        if (assessmentError) {
          throw assessmentError;
        }

        if (!assessmentData) {
          setLoadingError("Assessment not found");
          return;
        }

        setAssessment(assessmentData);

        // Set form values - removing time_limit, prevent_backtracking, and randomize_questions
        setFormData({
          title: assessmentData.title || "",
          description: assessmentData.description || "",
          difficulty: assessmentData.difficulty || "",
        });
      } catch (error: any) {
        console.error("Error loading assessment:", error.message);
        setLoadingError(`Failed to load assessment: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId]);

  if (loading) {
    return (
      <MainLayout>
        <Loading message="Loading assessment details..." />
      </MainLayout>
    );
  }

  if (loadingError) {
    return (
      <MainLayout>
        <ErrorMessage
          title="Assessment Not Found"
          message={loadingError}
          backUrl="/assessments"
          backLabel="Back to Assessments"
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Details</h1>
            <p className="text-muted-foreground mt-2">
              View and edit assessment information. Add, edit, or delete questions below.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/assessments">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessments
            </Link>
          </Button>
        </div>

        <Card className="p-6 mb-8">
          {loading ? (
            <Loading />
          ) : loadingError ? (
            <ErrorMessage message={loadingError} />
          ) : formData && (
            <AssessmentForm
              assessmentId={assessmentId || ""}
              initialData={formData}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['assessments'] });
              }}
            />
          )}
        </Card>

        {/* Questions management */}
        <Card className="mb-8">
          <AdminQuestionList assessmentId={assessmentId || ""} />
        </Card>
      </div>
    </MainLayout>
  );
};

export default AssessmentDetails;
