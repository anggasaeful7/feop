"use client";

import { useState, useRef, useCallback } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | null;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  onSearchChange?: (value: string) => void;
}

export function Combobox({
  options,
  value,
  onSelect,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari...",
  emptyText = "Tidak ditemukan.",
  disabled = false,
  className,
  onLoadMore,
  hasMore,
  isLoading,
  onSearchChange,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const hasInfiniteScroll = !!onLoadMore;

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (!node || !open || !hasInfiniteScroll || !hasMore || isLoading) return;
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) onLoadMore?.();
        },
        { rootMargin: "200px" }
      );
      observerRef.current.observe(node);
    },
    [open, hasInfiniteScroll, hasMore, isLoading, onLoadMore]
  );

  const selectedLabel = value
    ? options.find((opt) => opt.value === value)?.label
    : options.find((opt) => opt.value === "")?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal rounded-xl italic bg-transparent border-[#E4DDCB]",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate">{selectedLabel || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl border border-[#E4DDCB] bg-cream-50 text-foreground shadow-md" align="start">
        <Command className="bg-transparent" shouldFilter={!onSearchChange}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearchChange} />
          <CommandList className="max-h-75">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isActive = value === option.value || (!value && option.value === "");
                return (
                  <CommandItem
                    key={option.value || "empty-option"}
                    value={option.label}
                    onSelect={() => {
                      onSelect(option.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
              {hasInfiniteScroll && (
                <div
                  ref={sentinelRef}
                  className="flex items-center justify-center pt-2 pb-4"
                >
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  )}
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
