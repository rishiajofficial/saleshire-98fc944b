
import { UseToastOptions } from "@/components/ui/toast"
import {
  Toast,
  toast,
  ToasterToast,
  useToast as useToastInternal,
} from "@radix-ui/react-toast"

export { type ToasterToast, type Toast }

export const useToast = useToastInternal

export { toast }

export type { UseToastOptions }
