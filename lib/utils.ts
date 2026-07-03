import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const categoryColorMap: Record<"once" | "daily" | "weekly", string> = {
  once: "bg-sky-50 text-sky-700 border-sky-200 border",
  daily: "bg-emerald-50 text-emerald-700 border-emerald-200 border",
  weekly: "bg-purple-50 text-purple-700 border-purple-200 border",
};
