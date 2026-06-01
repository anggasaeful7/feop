"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Button, DataTable } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useResidentBillsByUnit } from "@/hooks/api/use-resident-bill";
import { useDebounce } from "@/hooks/use-debounce";
import { idr } from "@/lib/format";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError, downloadCSV } from "@/lib/axios";
import { ResidentBillByUnitItem } from "@/types/billing";
import { BillingDetails } from "./components/billing-details";

const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "paid", label: "Lunas" },
  { key: "pending_verification", label: "Pending" },
  { key: "unpaid", label: "Lewat" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

export default function BillingPenghuniPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [kind, setKind] = useState<string>("all");
  const [year, setYear] = useState<number>(2026);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [isExporting, setIsExporting] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

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
    {
      header: "Unit",
      id: "unit",
      cell: ({ row }) => {
        const unit = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-semibold text-zinc-900 bg-white px-2.5 py-1 rounded-md border border-[#E4DDCB]">
              {unit.unit_code}
            </span>
            {unit.unit_block && (
              <span className="text-[10px] text-zinc-500 font-semibold bg-zinc-200/60 px-1.5 py-0.5 rounded uppercase">
                Blok {unit.unit_block}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Penghuni",
      accessorKey: "resident_name",
      cell: ({ row }) => <span className="font-medium text-zinc-800">{row.original.resident_name || "—"}</span>,
    },
    {
      header: "Pemilik",
      accessorKey: "owner_name",
      cell: ({ row }) => <span className="text-zinc-600 text-sm">{row.original.owner_name || "—"}</span>,
    },
    {
      header: "Total Tagihan",
      id: "total_amount",
      cell: ({ row }) => {
        const totalBills = row.original.bills.reduce((sum, b) => sum + b.total_amount, 0);
        const totalDebt = row.original.bills_debt ? row.original.bills_debt.reduce((sum, b) => sum + b.total_amount, 0) : 0;
        const totalAmount = totalBills + totalDebt;
        return <span className="font-bold text-zinc-950">{idr(totalAmount)}</span>;
      },
    },
    {
      header: "Status Pembayaran",
      id: "status_summary",
      cell: ({ row }) => {
        const unit = row.original;
        const unpaidDebtCount = unit.bills_debt ? unit.bills_debt.filter(b => b.status === "unpaid" || b.status === "rejected").length : 0;
        const unpaidCount = unit.bills.filter(b => b.status === "unpaid" || b.status === "rejected").length + unpaidDebtCount;
        const pendingCount = unit.bills.filter(b => b.status === "pending_verification").length;
        const paidCount = unit.bills.filter(b => b.status === "paid").length;

        return (
          <div className="flex flex-wrap gap-1">
            {unpaidCount > 0 && (
              <Badge tone="danger">
                {unpaidCount} Lewat
              </Badge>
            )}
            {pendingCount > 0 && (
              <Badge tone="warning">
                {pendingCount} Pending
              </Badge>
            )}
            {paidCount > 0 && (
              <Badge tone="success">
                {paidCount} Lunas
              </Badge>
            )}
            {unit.bills.length === 0 && unpaidDebtCount === 0 && (
              <span className="text-xs text-zinc-400 italic">Tidak ada tagihan</span>
            )}
          </div>
        );
      },
    },
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
  ], [page, expandedUnits]);

  // Nested row detail rendering inside DataTable
  const renderRowDetails = (unit: ResidentBillByUnitItem) => {
    return (
      <BillingDetails
        unit={unit}
        year={year}
        handleTagih={handleTagih}
      />
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin · Kelola Tagihan"
        title="Billing Penghuni"
        subtitle="Status pembayaran per unit · Verifikasi bukti transfer"
      />

      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data tagihan"}
        </div>
      )}

      <DataTable
        data={units}
        columns={columns}
        isLoading={isLoading || isFetching}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        expandableRowKey={(row) => row.unit_id}
        expandedRowKeys={expandedUnits}
        onExpandedRowKeysChange={setExpandedUnits}
        renderRowDetails={renderRowDetails}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`h-9 rounded-full px-4 text-xs font-semibold transition ${activeTab === tab.key
                  ? tab.key === "unpaid"
                    ? "bg-rose-700 text-white"
                    : "bg-brand-900 text-white"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                  }`}
              >
                {tab.label}
              </button>
            ))}
            <div className="w-32">
              <Select
                value={kind}
                onValueChange={(v) => {
                  setKind(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-full border-zinc-300 text-xs font-semibold px-4 bg-white text-zinc-700">
                  <SelectValue placeholder="Semua Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jenis</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="specific">Spesifik</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-28">
              <Select
                value={year.toString()}
                onValueChange={(v) => {
                  setYear(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-9 rounded-full border-zinc-300 text-xs font-semibold px-4 bg-white text-zinc-700">
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
            <Button
              variant="secondary"
              size="sm"
              className="font-bold italic"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download size={14} className="mr-1" /> {isExporting ? "Mengekspor..." : "CSV / Excel"}
            </Button>
          </div>
        }
      />
    </>
  );
}
