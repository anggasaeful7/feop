import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("id-ID");
}

export function parseIDR(formatted: string): number | null {
  const raw = formatted.replace(/[^\d]/g, "");
  return raw === "" ? null : Number(raw);
}

export const categoryColorMap: Record<"once" | "daily" | "weekly", string> = {
  once: "bg-sky-50 text-sky-700 border-sky-200 border",
  daily: "bg-emerald-50 text-emerald-700 border-emerald-200 border",
  weekly: "bg-purple-50 text-purple-700 border-purple-200 border",
};
