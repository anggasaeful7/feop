"use client";

import type { ReactNode } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, type ButtonVariant } from "./button";

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

export function ModalFormFooter({
  isPending,
  isEditing,
  onClose,
  onSubmit,
  submitLabel,
  extraButtons,
  cancelVariant = "danger",
  submitVariant = "primary",
  submitDisabled = false,
  cancelLabel = "✕ Batal",
  isPendingText,
}: {
  isPending?: boolean;
  isEditing?: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: ReactNode;
  extraButtons?: ReactNode;
  cancelVariant?: ButtonVariant;
  submitVariant?: ButtonVariant;
  submitDisabled?: boolean;
  cancelLabel?: ReactNode;
  isPendingText?: string;
}) {
  return (
    <>
      {extraButtons}
      <Button variant={cancelVariant} type="button" onClick={onClose} disabled={isPending}>
        {cancelLabel}
      </Button>
      <Button variant={submitVariant} type="button" onClick={onSubmit} disabled={isPending || submitDisabled}>
        {isPending && !isPendingText && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending && isPendingText ? isPendingText : (isEditing ? "✓ Simpan Perubahan" : submitLabel)}
      </Button>
    </>
  );
}
