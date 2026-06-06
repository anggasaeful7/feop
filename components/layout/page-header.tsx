import type { ReactNode } from "react";

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
    <header className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 border-b border-zinc-200/70 pb-6">
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
      {actions && <div className="flex w-full md:w-auto shrink-0 items-center gap-3">{actions}</div>}
    </header>
  );
}
