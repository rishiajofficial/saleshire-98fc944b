
import { toast as sonnerToast, type ToastT } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
}

export const toast = {
  toast: ({ title, description, variant = "default" }: ToastProps) => {
    return sonnerToast(title, {
      description,
      className: variant === "destructive" 
        ? "bg-destructive text-destructive-foreground" 
        : variant === "success"
          ? "bg-green-600 text-white"
          : undefined,
    });
  }
};

export const useToast = () => {
  return toast;
};
