"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

interface FilterBarProps {
  children: React.ReactNode;
  activeFilterCount?: number;
  onReset?: () => void;
  alwaysDrawer?: boolean;
}

export function FilterBar({ children, activeFilterCount = 0, onReset, alwaysDrawer }: FilterBarProps) {
  const [open, setOpen] = useState(false);

  const button = (
    <button
      className={`relative inline-flex items-center justify-center gap-2 h-9 rounded-full px-4 text-xs font-semibold border transition ${activeFilterCount > 0
        ? "border-brand bg-brand text-white"
        : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
        }`}
    >
      <SlidersHorizontal size={13} />
      Filter
      {activeFilterCount > 0 && (
        <span className="ml-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white text-brand text-[10px] font-bold">
          {activeFilterCount}
        </span>
      )}
    </button>
  );

  const drawer = (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{button}</SheetTrigger>
      <SheetContent side="right" className="w-64 bg-cream-50 p-6 overflow-y-auto border-l border-zinc-200/60">
        <div className="flex items-center justify-between mb-6 pr-6">
          <SheetTitle className="text-sm font-bold text-zinc-900">Filter</SheetTitle>
          {onReset && activeFilterCount > 0 && (
            <button
              onClick={() => { onReset(); setOpen(false); }}
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition"
            >
              <X size={11} /> Reset
            </button>
          )}
        </div>
        <div className="space-y-4">{children}</div>
      </SheetContent>
    </Sheet>
  );

  if (alwaysDrawer) return drawer;

  return (
    <>
      <div className="hidden xl:flex items-center gap-3 flex-wrap">{children}</div>
      <div className="xl:hidden">{drawer}</div>
    </>
  );
}
