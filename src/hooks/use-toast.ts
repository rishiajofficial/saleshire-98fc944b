
import { toast as sonnerToast, type ToastT } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
};

export type Toast = ToastT;

const toast = ({
  title,
  description,
  variant = "default",
  duration = 3000,
}: ToastProps) => {
  return sonnerToast(title || "", {
    description,
    duration,
    className: variant === "destructive" ? "destructive" : "",
  });
};

export const useToast = () => {
  return {
    toast,
    // This is just to maintain compatibility with existing code
    // that expects a toasts property
    toasts: [] as Toast[],
  };
};

// For direct imports
export { toast };
