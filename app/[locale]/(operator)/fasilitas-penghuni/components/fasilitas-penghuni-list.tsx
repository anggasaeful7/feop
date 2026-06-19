"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { DataTable, Button } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { ApiError, downloadCSV } from "@/lib/axios";
import { toast } from "sonner";
import { useGeneralFacilitiesByUnit } from "@/hooks/api/use-general-facility";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { UnitWithGeneralFacilities } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RT_OPTIONS = [
  { value: "all", label: "Semua RT" },
  { value: "001", label: "RT 001" },
  { value: "002", label: "RT 002" },
  { value: "003", label: "RT 003" },
  { value: "004", label: "RT 004" },
  { value: "005", label: "RT 005" },
];

const LATE_TABS = [
  { key: "all", label: "Semua" },
  { key: "true", label: "Menunggak" },
] as const;

export function FasilitasPenghuniList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlYear = searchParams.get("year") || undefined;
  const urlUnitId = searchParams.get("unit_id") || undefined;
  const urlUnit = searchParams.get("unit") || undefined;
  const urlName = searchParams.get("name") || undefined;
  const urlIsLate = searchParams.get("is_late") || "all";

  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [lateFilter, setLateFilter] = useState<string>(urlIsLate);
  const [rtFilter, setRtFilter] = useState<string>("all");
  const [prevUrlIsLate, setPrevUrlIsLate] = useState(urlIsLate);

  const { data: permissions } = usePermissions();
  const canExport = hasPermission(permissions, "resident_bills", "export");

  // Sync state during render
  if (urlIsLate !== prevUrlIsLate) {
    setPrevUrlIsLate(urlIsLate);
    setLateFilter(urlIsLate);
  }

  const changeLateFilter = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("is_late");
    } else {
      params.set("is_late", val);
    }
    params.delete("page"); // Reset page on filter change
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const exportParams = new URLSearchParams();
      exportParams.set("min_months", "3");
      if (urlYear) exportParams.set("year", urlYear);
      if (urlUnitId) exportParams.set("unit_id", urlUnitId);
      if (urlUnit) exportParams.set("unit", urlUnit);
      if (urlName) exportParams.set("name", urlName);
      if (lateFilter !== "all") exportParams.set("is_late", lateFilter);
      if (rtFilter !== "all") exportParams.set("rt", rtFilter);

      await downloadCSV(`/resident-bills/export-overdue.pdf?${exportParams.toString()}`, "penghuni-menunggak.pdf");
      toast.success("Berhasil mengekspor PDF penghuni menunggak");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal mengekspor data PDF");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const { data, isLoading, isFetching, error } = useGeneralFacilitiesByUnit({
    search: debouncedSearch,
    page,
    per_page: perPage,
    year: urlYear,
    unit_id: urlUnitId,
    unit: urlUnit,
    name: urlName,
    rt: rtFilter === "all" ? undefined : rtFilter,
    is_late: lateFilter === "all" ? undefined : lateFilter,
  });

  const units = data?.items || [];
  const total = data?.total || 0;

  const columns: ColumnDef<UnitWithGeneralFacilities>[] = useMemo(() => [
    {
      header: "No",
      id: "index",
      cell: ({ row }) => (page - 1) * perPage + row.index + 1,
    },
    {
      accessorKey: "unit_code",
      header: "Kode Unit",
      cell: ({ row }) => <div className="font-bold text-zinc-900">{row.original.unit_code}</div>,
    },
    {
      accessorKey: "unit_block",
      header: "Blok",
    },
    {
      accessorKey: "owner_name",
      header: "Pemilik",
      cell: ({ row }) => row.original.owner_name || "-",
    },
    {
      accessorKey: "resident_name",
      header: "Penghuni",
      cell: ({ row }) => row.original.resident_name || "-",
    },
    {
      accessorKey: "bill_payer",
      header: "Pembayar",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.bill_payer || "-"}</span>
      ),
    },
    {
      id: "actions",
      header: "Fasilitas",
      cell: ({ row }) => {
        const unit = row.original;
        const isExpanded = expandedUnits.has(unit.unit_id);
        const count = unit.general_facilities?.length || 0;
        return (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs text-brand-900 font-bold hover:underline cursor-pointer">
              {isExpanded ? (
                <>
                  Tutup <ChevronUp size={14} />
                </>
              ) : (
                <>
                  Lihat ({count}) <ChevronDown size={14} />
                </>
              )}
            </span>
          </div>
        );
      },
    },
  ], [page, perPage, expandedUnits]);

  const renderRowDetails = (unit: UnitWithGeneralFacilities) => {
    const facilities = unit.general_facilities || [];

    return (
      <div className="flex flex-col gap-4 rounded-xl border border-[#E4DDCB] bg-white p-4 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Daftar Fasilitas</h4>
        <div className="rounded-lg border border-zinc-200 overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-zinc-50 text-zinc-600 font-semibold border-b border-zinc-200 uppercase tracking-wider text-[10px]">
                <th className="px-4 py-2 w-12">No</th>
                <th className="px-4 py-2">Nama Fasilitas</th>
                <th className="px-4 py-2 w-32">Status</th>
                <th className="px-4 py-2 w-48">Tanggal Assign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {facilities.map((fac, idx) => (
                <tr key={fac.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-zinc-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-800">{fac.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={fac.is_active ? "success" : "neutral"}>
                      {fac.is_active ? "Aktif" : "Non-Aktif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {fac.assigned_at ? new Date(fac.assigned_at).toLocaleDateString("id-ID") : "-"}
                  </td>
                </tr>
              ))}
              {facilities.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-400 italic">
                    Tidak ada fasilitas yang di-assign ke unit ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar Unit & Fasilitas"
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
              {LATE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => changeLateFilter(tab.key)}
                  className={`shrink-0 h-9 rounded-full px-4 text-xs font-semibold transition ${lateFilter === tab.key
                      ? tab.key === "true"
                        ? "bg-rose-700 text-white"
                        : "bg-brand-900 text-white"
                      : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-32">
              <Select
                value={rtFilter}
                onValueChange={(val) => {
                  setRtFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full h-9 rounded-full border-zinc-300 text-xs font-semibold px-4 bg-white text-zinc-700">
                  <SelectValue placeholder="Semua RT" />
                </SelectTrigger>
                <SelectContent>
                  {RT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {canExport && (
              <Button
                variant="secondary"
                size="sm"
                className="font-bold italic w-full sm:w-auto"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
              >
                <Download size={14} className="mr-1" /> {isExportingPdf ? "..." : "PDF Fasilitas"}
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
