import type { ReactNode } from "react";

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
