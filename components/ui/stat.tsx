import type { ReactNode, ComponentType } from "react";
import { cn } from "@/lib/utils";

export interface StatProps {
  label: string;
  value: string;
  hint?: ReactNode;
  tone?: "default" | "highlight" | "brand" | "success" | "danger" | "warning" | "info";
  icon?: ComponentType<{ className?: string; size?: number }>;
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
  icon: Icon,
}: StatProps) {
  const isHighlight = tone === "highlight";

  const toneClasses = {
    default: "border-l-zinc-300",
    brand: "border-l-[#0E3D33]",
    success: "border-l-emerald-600",
    danger: "border-l-rose-500",
    warning: "border-l-amber-500",
    info: "border-l-sky-500",
    highlight: "border-l-emerald-500",
  }[tone];

  const iconColors = {
    default: "bg-zinc-100 text-zinc-600",
    brand: "bg-[#0E3D33]/10 text-[#0E3D33]",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-rose-50 text-rose-500",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-sky-50 text-sky-600",
    highlight: "bg-emerald-50 text-emerald-600",
  }[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-200/70 p-5 bg-[#FFFDF7] border-l-4 shadow-sm hover:shadow-md hover:border-zinc-300/80 hover:-translate-y-0.5 transition-all duration-300",
        toneClasses,
        isHighlight && "bg-emerald-50/30"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {label}
          </div>
          <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl shadow-xs shrink-0", iconColors)}>
            <Icon size={20} className="stroke-[2.25]" />
          </div>
        )}
      </div>
      {hint && <div className="mt-4 flex items-center text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

