
import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import QuestionDetails from "./QuestionDetails";

interface AddQuestionProps {
  isOpen: boolean;
  sectionId: string;
  onOpenChange: (open: boolean) => void;
  onQuestionAdded?: () => void;
}

const AddQuestion = ({ isOpen, sectionId, onOpenChange, onQuestionAdded }: AddQuestionProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Add New Question</DrawerTitle>
          <DrawerDescription>
            Create a new question for this assessment section
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 py-2">
          <QuestionDetails 
            sectionId={sectionId}
            onSuccess={() => {
              if (onQuestionAdded) onQuestionAdded();
              onOpenChange(false);
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
        
        <DrawerFooter className="pt-2">
          <DrawerClose />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddQuestion;
