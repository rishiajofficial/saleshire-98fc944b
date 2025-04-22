
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  subMessage?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = "Loading...", 
  subMessage 
}) => {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <p className="text-lg text-muted-foreground">{message}</p>
          {subMessage && (
            <p className="text-sm text-muted-foreground mt-1">{subMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loading;
