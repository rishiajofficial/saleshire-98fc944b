
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
