"use client";

import { Calendar, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale";
import { Toggle } from "@/components/ui";

registerLocale("id", id);

interface DashboardFiltersProps {
  isAdminRw: boolean;
  isAdminRt: boolean;
  punishmentMonths: number;
  
  rwFilter: string;
  setRwFilter: (val: string) => void;
  rwOptions: { value: string; label: string }[];
  
  rtFilter: string;
  setRtFilter: (val: string) => void;
  rtOptions: { value: string; label: string }[];
  
  dateFilter: Date | null;
  setDateFilter: (date: Date | null) => void;
  
  onlyOverdue: boolean;
  setOnlyOverdue: (val: boolean) => void;
}

export function DashboardFilters({
  isAdminRw,
  isAdminRt,
  punishmentMonths,
  rwFilter,
  setRwFilter,
  rwOptions,
  rtFilter,
  setRtFilter,
  rtOptions,
  dateFilter,
  setDateFilter,
  onlyOverdue,
  setOnlyOverdue,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto">
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {!isAdminRt && !isAdminRw && (
          <div className="w-full sm:w-28">
            <Select
              value={rwFilter}
              onValueChange={(val) => {
                setRwFilter(val);
                setRtFilter("all");
              }}
            >
              <SelectTrigger className="w-full h-9 rounded-full border-zinc-300 text-xs font-semibold px-4 py-1 bg-white text-zinc-700">
                <SelectValue placeholder="Semua RW" />
              </SelectTrigger>
              <SelectContent>
                {rwOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {!isAdminRt && (
          <div className="w-full sm:w-28">
            <Select
              disabled={!isAdminRw && rwFilter === "all"}
              value={rtFilter}
              onValueChange={(val) => {
                setRtFilter(val);
              }}
            >
              <SelectTrigger className="w-full h-9 rounded-full border-zinc-300 text-xs font-semibold px-4 py-1 bg-white text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder="Semua RT" />
              </SelectTrigger>
              <SelectContent>
                {rtOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="relative w-full sm:w-auto">
          <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10" />
          <DatePicker
            selected={dateFilter}
            onChange={(date: Date | null) => setDateFilter(date)}
            dateFormat="MMMM yyyy"
            showMonthYearPicker
            locale="id"
            placeholderText="Semua Waktu"
            className="h-9 w-full sm:w-48 rounded-full border border-zinc-300 text-xs font-semibold pl-8 pr-8 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand cursor-pointer"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter(null)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-start gap-2 bg-zinc-100 rounded-full px-4 py-1.5 border border-zinc-200/50">
        <span className="text-xs font-bold text-zinc-700 whitespace-nowrap">
          Hanya Terlambat &ge; {punishmentMonths} Bln
        </span>
        <Toggle
          checked={onlyOverdue}
          onChange={setOnlyOverdue}
        />
      </div>
    </div>
  );
}
