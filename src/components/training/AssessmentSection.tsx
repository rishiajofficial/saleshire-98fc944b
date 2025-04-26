
import React from 'react';
import { Link } from "react-router-dom";
import { Book } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AssessmentSectionProps {
  quizzes: any[];
}

const AssessmentSection = ({ quizzes }: AssessmentSectionProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Book className="h-5 w-5 mr-2 text-green-500" /> Assessments
      </h3>
      
      {quizzes.length === 0 ? (
        <p className="text-gray-500 py-4">No assessments available for this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz: any) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle className="text-md font-semibold">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">
                  {quiz.description || "No description available."}
                </p>
                <p className="text-xs font-medium mb-4">
                  Difficulty: {quiz.difficulty || "Not specified"}
                </p>
                <Button asChild className="w-full">
                  <Link to={`/training/assessment/${quiz.id}`}>
                    Take Assessment
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentSection;
