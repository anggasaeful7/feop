"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  className = "max-w-lg",
}: {
  open: boolean;
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cn("w-full rounded-2xl bg-[#FFFDF7] p-6 shadow-xl", className)}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 w-full flex-1">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="text-zinc-400 hover:text-zinc-700"
          >
            <X size={18} />
          </button>
        </div>
        {children}
        {footer && (
          <div className="mt-6 flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-brand focus:ring-2 focus:ring-(--brand)/20";
