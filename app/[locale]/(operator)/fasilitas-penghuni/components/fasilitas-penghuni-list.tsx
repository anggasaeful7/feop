"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import { DataTable, Button, Toggle } from "@/components/ui";
import { FilterBar } from "@/components/ui/filter-bar";
import { ColumnDef } from "@tanstack/react-table";
import { ApiError, downloadCSV } from "@/lib/axios";
import { toast } from "sonner";
import { useGeneralFacilitiesByUnit } from "@/hooks/api/use-general-facility";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { UnitWithGeneralFacilities } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRts } from "@/hooks/api/use-rt";
import { useRws } from "@/hooks/api/use-rw";
import { useAuthUser } from "@/hooks/use-auth";

const LATE_TABS = [
  { key: "all", label: "Semua" },
  { key: "true", label: "Menunggak" },
] as const;

export function FasilitasPenghuniList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAuthUser();
  const urlYear = searchParams.get("year") || undefined;
  const urlUnitId = searchParams.get("unit_id") || undefined;
  const urlUnit = searchParams.get("unit") || undefined;
  const urlName = searchParams.get("name") || undefined;
  const urlIsLate = searchParams.get("is_late") || "all";

  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [lateFilter, setLateFilter] = useState<string>(urlIsLate);
  const [rwFilter, setRwFilter] = useState<string>("all");
  const [rtFilter, setRtFilter] = useState<string>("all");
  const [prevUrlIsLate, setPrevUrlIsLate] = useState(urlIsLate);
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);

  const isAdminRw = user?.role === "admin_rw";
  const isAdminRt = user?.role === "admin_rt";

  const { data: permissions } = usePermissions();
  const canExport = hasPermission(permissions, "resident_bills", "export");

  const { data: rwsData } = useRws({ per_page: 500 });
  const rws = useMemo(() => rwsData?.items || [], [rwsData?.items]);

  const selectedRwObj = useMemo(() => {
    if (rwFilter === "all" || !rwsData?.items) return null;
    return rwsData.items.find((item) => item.id === rwFilter || item.code === rwFilter) || null;
  }, [rwsData, rwFilter]);

  const { data: rtsData } = useRts({
    rw_id: isAdminRw ? user?.rw_id : selectedRwObj?.id,
    per_page: 500,
  });
  const rts = useMemo(() => rtsData?.items || [], [rtsData?.items]);

  const rwOptions = useMemo(() => {
    const base = [{ value: "all", label: "Semua RW" }];
    const seen = new Set<string>();
    const loaded: { value: string; label: string }[] = [];
    rws.forEach((item) => {
      const val = item.id || item.code;
      if (val && !seen.has(val)) {
        seen.add(val);
        loaded.push({ value: val, label: item.name || `RW ${item.code}` });
      }
    });
    return [...base, ...loaded];
  }, [rws]);

  const rtOptions = useMemo(() => {
    const base = [{ value: "all", label: "Semua RT" }];
    const seen = new Set<string>();
    const loaded: { value: string; label: string }[] = [];
    rts.forEach((item) => {
      const val = typeof item === "string" ? item : (item?.id || item?.code || "");
      const lbl = typeof item === "string" ? item : (item?.name || (item?.code ? `RT ${item.code}` : ""));
      if (val && !seen.has(val)) {
        seen.add(val);
        loaded.push({ value: val, label: lbl.startsWith("RT") ? lbl : `RT ${lbl}` });
      }
    });
    return [...base, ...loaded];
  }, [rts]);

  const overdue_months = onlyOverdue ? user?.punishment_months : undefined;
  const effectiveRwId = isAdminRt ? user?.rw_id : isAdminRw ? user?.rw_id : rwFilter === "all" ? undefined : rwFilter;
  const effectiveRtId = isAdminRt ? user?.rt_id : rtFilter === "all" ? undefined : rtFilter;

  const activeFilterCount = [
    !isAdminRw && !isAdminRt && rwFilter !== "all",
    !isAdminRt && rtFilter !== "all",
    onlyOverdue,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setRwFilter("all");
    setRtFilter("all");
    setOnlyOverdue(false);
  };

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
    params.delete("page");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const exportParams = new URLSearchParams();
      if (debouncedSearch) exportParams.set("search", debouncedSearch);
      if (urlYear) exportParams.set("year", urlYear);
      if (urlUnitId) exportParams.set("unit_id", urlUnitId);
      if (urlUnit) exportParams.set("unit", urlUnit);
      if (urlName) exportParams.set("name", urlName);
      if (lateFilter !== "all") exportParams.set("is_late", lateFilter);
      if (effectiveRwId) exportParams.set("rw_id", effectiveRwId);
      if (effectiveRtId) exportParams.set("rt_id", effectiveRtId);
      if (overdue_months) exportParams.set("overdue_months", overdue_months.toString());

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
    rw_id: effectiveRwId,
    rt_id: effectiveRtId,
    is_late: lateFilter === "all" ? undefined : lateFilter,
    overdue_months,
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
    { accessorKey: "unit_block", header: "Blok" },
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
      cell: ({ row }) => <span className="capitalize">{row.original.bill_payer || "-"}</span>,
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
              {isExpanded ? (<>Tutup <ChevronUp size={14} /></>) : (<>Lihat ({count}) <ChevronDown size={14} /></>)}
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
          <div className="flex items-center gap-2">
            {/* Late tabs — inline on wide desktop only */}
            <div className="hidden xl:flex gap-1.5">
              {LATE_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => changeLateFilter(tab.key)}
                  className={`h-9 rounded-full px-4 text-xs font-semibold transition whitespace-nowrap ${lateFilter === tab.key
                    ? tab.key === "true" ? "bg-rose-700 text-white" : "bg-brand-900 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden xl:block h-5 w-px bg-zinc-200" />

            <FilterBar activeFilterCount={activeFilterCount} onReset={resetFilters} alwaysDrawer>
              {/* Late tabs inside drawer for mobile/tablet */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Status</label>
                <div className="flex gap-1.5">
                  {LATE_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => changeLateFilter(tab.key)}
                      className={`h-9 rounded-full px-4 text-xs font-semibold transition whitespace-nowrap ${lateFilter === tab.key
                        ? tab.key === "true" ? "bg-rose-700 text-white" : "bg-brand-900 text-white"
                        : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* RW — hidden for admin_rw and admin_rt */}
              {!isAdminRw && !isAdminRt && (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">RW</label>
                  <Select value={rwFilter} onValueChange={(val) => { setRwFilter(val); setRtFilter("all"); setPage(1); }}>
                    <SelectTrigger className="w-full h-9 rounded-lg border-zinc-200 text-xs font-medium bg-zinc-50 text-zinc-800">
                      <SelectValue placeholder="Semua RW" />
                    </SelectTrigger>
                    <SelectContent>
                      {rwOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* RT — hidden for admin_rt */}
              {!isAdminRt && (
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">RT</label>
                  <Select disabled={!isAdminRw && rwFilter === "all"} value={rtFilter} onValueChange={(v) => { setRtFilter(v); setPage(1); }}>
                    <SelectTrigger className="w-full h-9 rounded-lg border-zinc-200 text-xs font-medium bg-zinc-50 text-zinc-800 disabled:opacity-40">
                      <SelectValue placeholder="Semua RT" />
                    </SelectTrigger>
                    <SelectContent>
                      {rtOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Overdue toggle */}
              {user?.punishment_months ? (
                <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                  <div>
                    <p className="text-xs font-semibold text-zinc-800">Hanya Terlambat</p>
                    <p className="text-[11px] text-zinc-500">≥ {user.punishment_months} bulan menunggak</p>
                  </div>
                  <Toggle checked={onlyOverdue} onChange={setOnlyOverdue} />
                </div>
              ) : null}
            </FilterBar>

            {/* Export PDF */}
            {canExport && (
              <Button
                variant="secondary"
                size="sm"
                className="h-9 px-4 font-bold italic text-xs"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
              >
                <Download size={13} className="mr-1" />
                {isExportingPdf ? "..." : "PDF"}
              </Button>
            )}
          </div>
        }
      />
    </div>
  );
}
