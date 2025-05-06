
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(input: string | number | Date): string {
  const date = new Date(input);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(input: string | number | Date): string {
  return `${formatDate(input)} at ${formatTime(input)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function generateRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Add formatDuration function
export function formatDuration(duration: string): string {
  // Handle MM:SS format
  if (/^\d+:\d{2}$/.test(duration)) {
    return duration;
  }
  
  // Handle seconds as number
  if (!isNaN(Number(duration))) {
    const seconds = parseInt(duration, 10);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
  // Return as is if not in expected format
  return duration;
}
