import type { ReactNode } from "react";

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "running";

export function Badge({
  children,
  tone,
  variant,
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: "default" | "secondary" | "destructive" | "outline" | string;
  className?: string;
}) {
  const styles: Record<BadgeTone, string> = {
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800",
    info: "bg-sky-100 text-sky-800",
    neutral: "bg-zinc-100 text-zinc-700",
    running: "bg-amber-100 text-amber-800",
  };

  // Polyfill for Shadcn variants
  const variantStyles: Record<string, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "text-foreground",
  };

  const baseClass = "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium";
  let appliedClass = styles.neutral;

  if (tone && styles[tone]) {
    appliedClass = styles[tone];
  } else if (variant && variantStyles[variant]) {
    appliedClass = variantStyles[variant];
  }

  return (
    <span
      className={`${baseClass} ${appliedClass} ${className}`}
    >
      {children}
    </span>
  );
}
