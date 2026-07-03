"use client";

import React from "react";
import { useResidentBillSummary } from "@/hooks/api/use-resident-bill";
import { Skeleton } from "@/components/ui";
import { idr } from "@/lib/format";

type ResidentBillSummaryProps = {
  year: number;
  kind: string;
  rwFilter: string;
  rtFilter: string;
  search: string;
  unitId?: string;
  unit?: string;
  name?: string;
  isLate?: string;
  overdueMoonths?: number;
};

export function ResidentBillSummary({
  year,
  kind,
  rwFilter,
  rtFilter,
  search,
  unitId,
  unit,
  name,
  isLate,
  overdueMoonths,
}: ResidentBillSummaryProps) {
  const { data: summaryData, isLoading: isLoadingSummary } = useResidentBillSummary({
    year,
    kind: kind === "all" ? undefined : kind,
    rw: rwFilter === "all" ? undefined : rwFilter,
    rt: rtFilter === "all" ? undefined : rtFilter,
    search: search || undefined,
    unit_id: unitId,
    unit,
    name,
    is_late: isLate,
    overdue_months: overdueMoonths,
  });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Tagihan */}
      <div className="rounded-xl border border-zinc-200/70 bg-white px-5 py-4 shadow-sm">
        <div className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
          Total Tagihan
        </div>
        <div className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">
          {isLoadingSummary ? (
            <Skeleton className="h-9 w-36 animate-pulse bg-zinc-200" />
          ) : (
            idr(summaryData?.total_amount || 0)
          )}
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          {isLoadingSummary ? (
            <Skeleton className="h-4 w-24 animate-pulse bg-zinc-200" />
          ) : (
            <span className="font-medium text-zinc-600">
              {summaryData?.total_bills || 0} Tagihan
            </span>
          )}
        </div>
      </div>

      {/* Lunas */}
      <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/40 px-5 py-4 shadow-sm">
        <div className="text-[11px] font-semibold tracking-wider text-emerald-800 uppercase">
          Lunas
        </div>
        <div className="mt-2 text-3xl font-bold tracking-tight text-emerald-950">
          {isLoadingSummary ? (
            <Skeleton className="h-9 w-36 animate-pulse bg-emerald-200" />
          ) : (
            idr(summaryData?.paid_amount || 0)
          )}
        </div>
        <div className="mt-2 text-xs text-emerald-700">
          {isLoadingSummary ? (
            <Skeleton className="h-4 w-24 animate-pulse bg-emerald-200" />
          ) : (
            <span className="font-medium">
              {summaryData?.paid_bills || 0} Tagihan
            </span>
          )}
        </div>
      </div>

      {/* Belum Bayar */}
      <div className="rounded-xl border border-rose-200/50 bg-rose-50/40 px-5 py-4 shadow-sm">
        <div className="text-[11px] font-semibold tracking-wider text-rose-800 uppercase">
          Belum Bayar
        </div>
        <div className="mt-2 text-3xl font-bold tracking-tight text-rose-950">
          {isLoadingSummary ? (
            <Skeleton className="h-9 w-36 animate-pulse bg-rose-200" />
          ) : (
            idr(summaryData?.unpaid_amount || 0)
          )}
        </div>
        <div className="mt-2 text-xs text-rose-700">
          {isLoadingSummary ? (
            <Skeleton className="h-4 w-24 animate-pulse bg-rose-200" />
          ) : (
            <span className="font-medium">
              {summaryData?.unpaid_bills || 0} Tagihan
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
