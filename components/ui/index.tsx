import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-6 border-b border-zinc-200/70 pb-6">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs italic text-zinc-500">{eyebrow}</div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-2xl border border-zinc-200/70 bg-[#FFFDF7] p-6", className)}
    >
      {children}
    </div>
  );
}

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "warning";
export type ButtonSize = "sm" | "md";

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 text-sm",
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#4F7A52] text-white hover:opacity-90",
    secondary:
      "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50",
    ghost: "text-zinc-700 hover:bg-zinc-100",
    danger: "bg-[#A83A2E] text-white hover:opacity-90",
    warning: "bg-amber-600 text-white hover:bg-amber-700",
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "running";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  const styles: Record<BadgeTone, string> = {
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    info: "bg-sky-100 text-sky-800",
    neutral: "bg-zinc-100 text-zinc-700",
    running: "bg-amber-100 text-amber-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "default" | "highlight";
}) {
  return (
    <div
      className={`rounded-xl border border-zinc-200/70 px-5 py-4 ${tone === "highlight" ? "bg-emerald-50/60" : "bg-white"
        }`}
    >
      <div className="text-[11px] font-semibold tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
        {value}
      </div>
      {hint && <div className="mt-2 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-brand" : "bg-zinc-300"
        }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"
          }`}
      />
    </button>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
    >
      {children}
    </div>
  );
}

export * from "./data-table";
export * from "./modal";
