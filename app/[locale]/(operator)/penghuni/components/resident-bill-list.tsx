"use client";

import React, { useState, useMemo } from "react";
import { Download, ChevronDown, ChevronUp } from "lucide-react";
import { Button, DataTable } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useResidentBillsByUnit } from "@/hooks/api/use-resident-bill";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { idr } from "@/lib/format";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError, downloadCSV } from "@/lib/axios";
import { ResidentBillByUnitItem, ResidentBill } from "@/types/billing";
import { useBulkDeleteSpecificBillingGeneratedBills } from "@/hooks/api/use-specific-billing";
import { Trash } from "lucide-react";
import { BillingDetails } from "./billing-details";
import { baseColumns } from "./columns";

const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "paid", label: "Lunas" },
  { key: "pending_verification", label: "Pending" },
  { key: "unpaid", label: "Belum Bayar" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

export function ResidentBillList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [kind, setKind] = useState<string>("all");
  const [year, setYear] = useState<number>(2026);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());
  const bulkDelete = useBulkDeleteSpecificBillingGeneratedBills();

  const handleSelectBill = (id: string, checked: boolean) => {
    setSelectedBills((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean, bills: ResidentBill[]) => {
    setSelectedBills((prev) => {
      const next = new Set(prev);
      bills.forEach((b) => {
        if (b.kind === "specific" && b.status !== "paid") {
          if (checked) next.add(b.id);
          else next.delete(b.id);
        }
      });
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedBills.size === 0) return;
    if (confirm(`Yakin ingin menghapus ${selectedBills.size} tagihan terpilih?`)) {
      bulkDelete.mutate({ bill_ids: Array.from(selectedBills) }, {
        onSuccess: () => setSelectedBills(new Set()),
      });
    }
  };

  const exportUrl = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set("year", year.toString());
    if (activeTab !== "all") qs.set("status", activeTab);
    if (kind !== "all") qs.set("kind", kind);
    if (debouncedSearch) qs.set("search", debouncedSearch);
    const query = qs.toString();
    return `/api/v1/resident-bills/export.xlsx${query ? `?${query}` : ""}`;
  }, [activeTab, kind, debouncedSearch, year]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadCSV(exportUrl, "billing-penghuni.xlsx");
      toast.success("Berhasil mengekspor data billing");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  // Load resident bills grouped by unit
  const { data: billsData, isLoading, isFetching, error } = useResidentBillsByUnit({
    year,
    status: activeTab === "all" ? undefined : activeTab,
    kind: kind === "all" ? undefined : kind,
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const units = billsData?.items || [];
  const total = billsData?.total || 0;

  const handleTagih = (unitCode: string, title: string, amount: number) => {
    toast.success(`Reminder tagihan ${title} sebesar ${idr(amount)} dikirim ke Unit ${unitCode}`);
  };

  // TanStack columns definition for DataTable
  const columns: ColumnDef<ResidentBillByUnitItem>[] = useMemo(() => [
    {
      header: "No",
      id: "index",
      cell: ({ row }) => (page - 1) * perPage + row.index + 1,
    },
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => {
        const unit = row.original;
        const isExpanded = expandedUnits.has(unit.unit_id);
        const totalCount = unit.bills.length + (unit.bills_debt?.length || 0);
        return (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs text-brand-900 font-bold hover:underline">
              {isExpanded ? (
                <>
                  Tutup <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Lihat ({totalCount}) <ChevronDown size={14} />
                </>
              )}
            </span>
          </div>
        );
      },
    },
  ], [page, perPage, expandedUnits]);

  // Nested row detail rendering inside DataTable
  const renderRowDetails = (unit: ResidentBillByUnitItem) => {
    return (
      <BillingDetails
        unit={unit}
        year={year}
        handleTagih={handleTagih}
        selectedBills={selectedBills}
        handleSelectBill={handleSelectBill}
        handleSelectAll={handleSelectAll}
      />
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data tagihan"}
        </div>
      )}

      <DataTable
        data={units}
        columns={columns}
        isLoading={isLoading || isFetching}
        search={search}
        onSearchChange={setSearch}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        expandableRowKey={(row) => row.unit_id}
        expandedRowKeys={expandedUnits}
        onExpandedRowKeysChange={setExpandedUnits}
        renderRowDetails={renderRowDetails}
        actions={
          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
            <div className="flex overflow-x-auto gap-2 pb-1 sm:pb-0 w-full sm:w-auto hide-scrollbar">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                  className={`shrink-0 h-9 rounded-full px-4 text-xs font-semibold transition ${activeTab === tab.key
                    ? tab.key === "unpaid"
                      ? "bg-rose-700 text-white"
                      : "bg-brand-900 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none sm:w-32">
                <Select
                  value={kind}
                  onValueChange={(v) => {
                    setKind(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-full border-zinc-300 text-xs font-semibold px-4 bg-white text-zinc-700">
                    <SelectValue placeholder="Semua Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="specific">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 sm:flex-none sm:w-28">
                <Select
                  value={year.toString()}
                  onValueChange={(v) => {
                    setYear(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full h-9 rounded-full border-zinc-300 text-xs font-semibold px-4 bg-white text-zinc-700">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="font-bold italic w-full sm:w-auto"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download size={14} className="mr-1" /> {isExporting ? "Mengekspor..." : "CSV / Excel"}
            </Button>
          </div>
        }
      />

      {/* Floating Bulk Action Bar */}
      {selectedBills.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-4 rounded-full bg-zinc-900 px-6 py-3 text-sm shadow-xl border border-zinc-700">
            <span className="font-semibold text-white">
              {selectedBills.size} tagihan terpilih
            </span>
            <div className="h-4 w-px bg-zinc-700" />
            <Button
              variant="danger"
              size="sm"
              className="h-8 rounded-full px-4 font-semibold"
              onClick={handleDeleteSelected}
              disabled={bulkDelete.isPending}
            >
              <Trash size={14} className="mr-2" /> {bulkDelete.isPending ? "Menghapus..." : "Hapus Tagihan"}
            </Button>
            <button
              className="text-zinc-400 hover:text-white transition-colors p-1"
              onClick={() => setSelectedBills(new Set())}
            >
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
