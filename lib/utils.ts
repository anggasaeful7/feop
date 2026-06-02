import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatLocalDate = (date: Date | null) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalTime = (timeStr: string) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const formatLocalTime = (date: Date | null) => {
  if (!date) return "";
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const categoryColorMap: Record<"once" | "daily" | "weekly", string> = {
  once: "bg-sky-50 text-sky-700 border-sky-200 border",
  daily: "bg-emerald-50 text-emerald-700 border-emerald-200 border",
  weekly: "bg-purple-50 text-purple-700 border-purple-200 border",
};

export const getMonthDateRange = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthStr = String(month + 1).padStart(2, "0");
  const dateFrom = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const dateTo = `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
  return { dateFrom, dateTo };
};
