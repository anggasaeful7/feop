"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { DataTable } from "@/components/ui";
import { FilterBar } from "@/components/ui/filter-bar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePayoutLogs } from "@/hooks/api/use-payout";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { idr, parseLocalDate, formatLocalDate } from "@/lib/format";
import { payoutStatusVariant, PAYOUT_LOG_STATUSES } from "@/types/payout";
import type { PayoutLog } from "@/types/payout";

const BADGE_VARIANTS: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-sky-50 text-sky-700 border-sky-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  default: "bg-zinc-50 text-zinc-600 border-zinc-200",
};

export function PayoutLogList() {
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status") || undefined;
  const urlDateFrom = searchParams.get("date_from") || undefined;
  const urlDateTo = searchParams.get("date_to") || undefined;

  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const [statusFilter, setStatusFilter] = useState<string>(urlStatus || "all");
  const [dateFrom, setDateFrom] = useState<string>(urlDateFrom || "");
  const [dateTo, setDateTo] = useState<string>(urlDateTo || "");

  const activeFilterCount = [
    statusFilter !== "all",
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const { data, isLoading, isFetching, error } = usePayoutLogs({
    status: statusFilter === "all" ? undefined : statusFilter,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
  });

  const items = data?.items || [];
  const total = data?.total || 0;

  const columns: ColumnDef<PayoutLog>[] = useMemo(
    () => [
      {
        header: "No",
        id: "index",
        cell: ({ row }) => (page - 1) * perPage + row.index + 1,
        size: 50,
      },
      {
        accessorKey: "workspace_name",
        header: "Workspace Name",
        cell: ({ row }) => (
          <span className="text-zinc-700 font-medium">{row.original.workspace_name || "—"}</span>
        ),
      },
      {
        accessorKey: "bank_account_name",
        header: "Bank Account Name",
        cell: ({ row }) => (
          <span className="text-zinc-600">{row.original.bank_account_name || "—"}</span>
        ),
      },
      {
        accessorKey: "bank_account_number",
        header: "Bank Account Number",
        cell: ({ row }) => (
          <span className="text-zinc-600 font-mono text-xs">{row.original.bank_account_number || "—"}</span>
        ),
      },
      {
        accessorKey: "sub_account_number",
        header: "Sub Account Number",
        cell: ({ row }) => (
          <span className="text-zinc-600 font-mono text-xs">{row.original.sub_account_number || "—"}</span>
        ),
      },
      {
        accessorKey: "balance_before_payout",
        header: "Balance Before Payout",
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-900">{idr(Number(row.original.balance_before_payout))}</span>
        ),
      },
      {
        accessorKey: "payout_balance",
        header: "Payout Balance",
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-900">{idr(Number(row.original.payout_balance))}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          const variant = payoutStatusVariant(status);
          return (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${BADGE_VARIANTS[variant] || BADGE_VARIANTS.default}`}
            >
              {status}
            </span>
          );
        },
        size: 120,
      },
    ],
    [page, perPage]
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data payout logs"}
        </div>
      )}

      <DataTable
        title="Riwayat Payout"
        data={items}
        columns={columns}
        isLoading={isLoading || isFetching}
        search={search}
        onSearchChange={setSearch}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <div className="flex items-center gap-2">
            <FilterBar activeFilterCount={activeFilterCount} onReset={resetFilters} alwaysDrawer>
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                  Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => { setStatusFilter(v); setPage(1); }}
                >
                  <SelectTrigger className="w-full h-9 rounded-lg border-zinc-200 text-xs font-medium bg-zinc-50 text-zinc-800">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {PAYOUT_LOG_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                  Dari Tanggal
                </label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10" />
                  <DatePicker
                    selected={dateFrom ? parseLocalDate(dateFrom) : null}
                    onChange={(d: Date | null) => { setDateFrom(formatLocalDate(d)); setPage(1); }}
                    dateFormat="dd MMM yyyy"
                    locale="id"
                    placeholderText="Pilih tanggal"
                    className="w-full h-9 rounded-lg border border-zinc-200 text-xs font-medium pl-8 pr-3 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                  Sampai Tanggal
                </label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10" />
                  <DatePicker
                    selected={dateTo ? parseLocalDate(dateTo) : null}
                    onChange={(d: Date | null) => { setDateTo(formatLocalDate(d)); setPage(1); }}
                    dateFormat="dd MMM yyyy"
                    locale="id"
                    placeholderText="Pilih tanggal"
                    minDate={dateFrom ? parseLocalDate(dateFrom) ?? undefined : undefined}
                    className="w-full h-9 rounded-lg border border-zinc-200 text-xs font-medium pl-8 pr-3 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer"
                  />
                </div>
              </div>
            </FilterBar>
          </div>
        }
      />
    </div>
  );
}
