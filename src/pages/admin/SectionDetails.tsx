
import React from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EditSection from "@/components/assessments/EditSection";

const SectionDetails = () => {
  const { assessmentId, sectionId } = useParams<{ assessmentId: string; sectionId: string }>();

  if (!assessmentId || !sectionId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Section Not Found</h1>
          <Button asChild variant="outline">
            <Link to="/assessments">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessments
            </Link>
          </Button>
        </div>
        <p>Missing assessment or section ID in the URL.</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Section Questions</h1>
        <Button asChild variant="outline">
          <Link to={`/assessments/${assessmentId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Assessment
          </Link>
        </Button>
      </div>
      
      <EditSection assessmentId={assessmentId} sectionId={sectionId} />
    </MainLayout>
  );
};

export default SectionDetails;
