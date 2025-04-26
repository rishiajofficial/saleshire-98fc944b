
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

export const ApplicationPrompt = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
      <AlertCircle className="text-amber-500 h-5 w-5 mr-2 mt-0.5" />
      <div>
        <h3 className="font-medium text-amber-800">Application Required</h3>
        <p className="text-sm text-amber-700 mt-1">
          You need to complete your application before proceeding with the hiring process.
        </p>
        <Button 
          size="sm" 
          className="mt-3 bg-amber-600 hover:bg-amber-700"
          asChild
        >
          <Link to="/application">
            Complete Application Now
          </Link>
        </Button>
      </div>
    </div>
  );
};
