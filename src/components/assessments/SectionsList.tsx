
import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Section {
  id: string;
  title: string;
  description: string | null;
}

interface SectionsListProps {
  assessmentId: string;
  sections: Section[];
}

const SectionsList: React.FC<SectionsListProps> = ({ assessmentId, sections }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Assessment Sections</CardTitle>
          <CardDescription>
            Manage the sections of this assessment
          </CardDescription>
        </div>
        <Button asChild size="sm">
          <Link to={`/assessments/sections/new?assessmentId=${assessmentId}`}>
            <Plus className="h-4 w-4 mr-1" /> Add Section
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <div className="flex justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/30" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No sections yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              This assessment doesn't have any sections. Add sections to organize questions.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to={`/assessments/sections/new?assessmentId=${assessmentId}`}>
                <Plus className="h-4 w-4 mr-1" /> Add Your First Section
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/assessments/sections/${section.id}`}>
                        Edit Section
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {section.description ? (
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No description provided</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SectionsList;
