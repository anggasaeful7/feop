import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "warning"
  | "outline"; // added outline for compatibility
export type ButtonSize = "sm" | "md" | "icon";

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
    icon: "h-9 w-9", // added icon size for compatibility
  };
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#4F7A52] text-white hover:opacity-90",
    secondary: "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50",
    ghost: "text-zinc-700 hover:bg-zinc-100",
    danger: "bg-[#A83A2E] text-white hover:opacity-90",
    warning: "bg-amber-600 text-white hover:bg-amber-700",
    outline: "border border-zinc-300 bg-transparent text-zinc-800 hover:bg-zinc-50",
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
