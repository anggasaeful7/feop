"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Download, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Button, DataTable, Toggle } from "@/components/ui";
import { FilterBar } from "@/components/ui/filter-bar";
import { ColumnDef } from "@tanstack/react-table";
import { useResidentBillsByUnit } from "@/hooks/api/use-resident-bill";
import { ResidentBillSummary } from "./resident-bill-summary";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { idr } from "@/lib/format";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError, downloadCSV } from "@/lib/axios";
import { ResidentBillByUnitItem, ResidentBill } from "@/types/billing";
import { useBulkDeleteSpecificBillingGeneratedBills } from "@/hooks/api/use-specific-billing";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
import { Trash } from "lucide-react";
import { BillingDetails } from "./billing-details";
import { baseColumns } from "./columns";
import { useRts } from "@/hooks/api/use-rt";
import { useRws } from "@/hooks/api/use-rw";
import { useAuthUser } from "@/hooks/use-auth";
import DatePicker from "react-datepicker";

const STATUS_TABS = [
  { key: "all", label: "Semua" },
  { key: "paid", label: "Lunas" },
  { key: "unpaid", label: "Belum Bayar" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["key"];

export function ResidentBillList() {
  const searchParams = useSearchParams();
  const user = useAuthUser();
  const urlYear = searchParams.get("year");
  const urlUnitId = searchParams.get("unit_id") || undefined;
  const urlUnit = searchParams.get("unit") || undefined;
  const urlName = searchParams.get("name") || undefined;
  const urlIsLate = searchParams.get("is_late") || undefined;

  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [kind, setKind] = useState<string>("all");
  const [rwFilter, setRwFilter] = useState<string>("all");
  const [rtFilter, setRtFilter] = useState<string>("all");
  const [yearDate, setYearDate] = useState<Date | null>(
    urlYear ? new Date(Number(urlYear), 0, 1) : new Date(new Date().getFullYear(), 0, 1)
  );
  const year = yearDate ? yearDate.getFullYear() : new Date().getFullYear();
  const [prevUrlYear, setPrevUrlYear] = useState(urlYear);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);

  const isAdminRw = user?.role === "admin_rw";
  const isAdminRt = user?.role === "admin_rt";

  const { data: permissions } = usePermissions();
  const canExport = hasPermission(permissions, "resident_bills", "export");
  const canDelete = hasPermission(permissions, "resident_bills", "delete");

  const { data: rwsData } = useRws({ per_page: 500 });
  const rws = useMemo(() => rwsData?.items || [], [rwsData?.items]);

  const selectedRwObj = useMemo(() => {
    if (rwFilter === "all" || !rwsData?.items) return null;
    return rwsData.items.find((item) => item.code === rwFilter) || null;
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
      if (item.code && !seen.has(item.code)) {
        seen.add(item.code);
        loaded.push({ value: item.code, label: item.name || `RW ${item.code}` });
      }
    });
    return [...base, ...loaded];
  }, [rws]);

  const rtOptions = useMemo(() => {
    const base = [{ value: "all", label: "Semua RT" }];
    const seen = new Set<string>();
    const loaded: { value: string; label: string }[] = [];
    rts.forEach((item) => {
      const val = typeof item === "string" ? item : (item?.code || item?.name || item?.id || "");
      if (val && !seen.has(val)) {
        seen.add(val);
        loaded.push({ value: val, label: val.startsWith("RT") ? val : `RT ${val}` });
      }
    });
    return [...base, ...loaded];
  }, [rts]);

  const overdue_months = onlyOverdue ? user?.punishment_months : undefined;
  const effectiveRw = isAdminRt ? user?.rw : isAdminRw ? user?.rw : rwFilter === "all" ? undefined : rwFilter;
  const effectiveRt = isAdminRt ? user?.rt : rtFilter === "all" ? undefined : rtFilter;

  // Count active secondary filters for the badge
  const activeFilterCount = [
    !isAdminRw && !isAdminRt && rwFilter !== "all",
    !isAdminRt && rtFilter !== "all",
    kind !== "all",
    year !== new Date().getFullYear(),
    onlyOverdue,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setRwFilter("all");
    setRtFilter("all");
    setKind("all");
    setYearDate(new Date(new Date().getFullYear(), 0, 1));
    setOnlyOverdue(false);
  };

  if (urlYear !== prevUrlYear) {
    setPrevUrlYear(urlYear);
    setYearDate(urlYear ? new Date(Number(urlYear), 0, 1) : new Date(new Date().getFullYear(), 0, 1));
  }

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

  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const exportParams = new URLSearchParams();
      if (year) exportParams.set("year", year.toString());
      if (activeTab !== "all") exportParams.set("status", activeTab);
      if (kind !== "all") exportParams.set("kind", kind);
      if (effectiveRw) exportParams.set("rw", effectiveRw);
      if (effectiveRt) exportParams.set("rt", effectiveRt);
      if (debouncedSearch) exportParams.set("search", debouncedSearch);
      if (urlUnitId) exportParams.set("unit_id", urlUnitId);
      if (urlUnit) exportParams.set("unit", urlUnit);
      if (urlName) exportParams.set("name", urlName);
      if (urlIsLate) exportParams.set("is_late", urlIsLate);
      if (overdue_months) exportParams.set("overdue_months", overdue_months.toString());
      exportParams.set("sort", "monthly");

      await downloadCSV(`/resident-bills/export-billing.xlsx?${exportParams.toString()}`, "billing-penghuni.xlsx");
      toast.success("Berhasil mengekspor data billing Excel");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Gagal mengekspor data Excel");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const { data: billsData, isLoading, isFetching, error } = useResidentBillsByUnit({
    year,
    status: activeTab === "all" ? undefined : activeTab,
    kind: kind === "all" ? undefined : kind,
    rw: effectiveRw,
    rt: effectiveRt,
    search: debouncedSearch,
    page,
    per_page: perPage,
    unit_id: urlUnitId,
    unit: urlUnit,
    name: urlName,
    is_late: urlIsLate,
    sort: "monthly",
    overdue_months,
  });

  const units = billsData?.items || [];
  const total = billsData?.total || 0;

  const handleTagih = (unitCode: string, title: string, amount: number) => {
    toast.success(`Reminder tagihan ${title} sebesar ${idr(amount)} dikirim ke Unit ${unitCode}`);
  };

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
              {isExpanded ? (<>Tutup <ChevronUp size={14} /></>) : (<>Lihat ({totalCount}) <ChevronDown size={14} /></>)}
            </span>
          </div>
        );
      },
    },
  ], [page, perPage, expandedUnits]);

  const renderRowDetails = (unit: ResidentBillByUnitItem) => (
    <BillingDetails
      unit={unit}
      year={year}
      handleTagih={handleTagih}
      selectedBills={selectedBills}
      handleSelectBill={handleSelectBill}
      handleSelectAll={handleSelectAll}
    />
  );

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data tagihan"}
        </div>
      )}

      <ResidentBillSummary
        year={year}
        kind={kind}
        rwFilter={effectiveRw ?? "all"}
        rtFilter={effectiveRt ?? "all"}
        search={debouncedSearch}
        unitId={urlUnitId}
        unit={urlUnit}
        name={urlName}
        isLate={urlIsLate}
        overdueMoonths={overdue_months}
      />

      <DataTable
        title="Daftar Unit & Billing"
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
            {/* Status tabs — inline on wide desktop only */}
            <div className="hidden xl:flex gap-1.5">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setPage(1); }}
                  className={`h-9 rounded-full px-4 text-xs font-semibold transition whitespace-nowrap ${activeTab === tab.key
                    ? tab.key === "unpaid" ? "bg-rose-700 text-white" : "bg-brand-900 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden xl:block h-5 w-px bg-zinc-200" />

            <FilterBar activeFilterCount={activeFilterCount} onReset={resetFilters} alwaysDrawer>
              {/* Status tabs inside drawer for mobile/tablet */}
              <div className="flex flex-col lg:hidden">
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Status</label>
                <div className="flex flex-col gap-1.5">
                  {STATUS_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setActiveTab(tab.key); setPage(1); }}
                      className={`h-9 rounded-full px-4 text-xs font-semibold transition whitespace-nowrap ${activeTab === tab.key
                        ? tab.key === "unpaid" ? "bg-rose-700 text-white" : "bg-brand-900 text-white"
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

              {/* Jenis tagihan */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Jenis Tagihan</label>
                <Select value={kind} onValueChange={(v) => { setKind(v); setPage(1); }}>
                  <SelectTrigger className="w-full h-9 rounded-lg border-zinc-200 text-xs font-medium bg-zinc-50 text-zinc-800">
                    <SelectValue placeholder="Semua Jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                    <SelectItem value="specific">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tahun */}
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 block">Tahun</label>
                <div className="relative">
                  <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10" />
                  <DatePicker
                    selected={yearDate}
                    onChange={(d: Date | null) => { setYearDate(d); setPage(1); }}
                    showYearPicker
                    dateFormat="yyyy"
                    locale="id"
                    placeholderText="Pilih Tahun"
                    className="w-full h-9 rounded-lg border border-zinc-200 text-xs font-medium pl-8 pr-3 bg-zinc-50 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer"
                  />
                </div>
              </div>

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

            {/* Export button */}
            {canExport && (
              <Button
                variant="secondary"
                size="sm"
                className="h-9 px-4 text-xs font-bold italic"
                onClick={handleExportExcel}
                disabled={isExportingExcel}
              >
                <Download size={13} className="mr-1" />
                {isExportingExcel ? "..." : "Excel"}
              </Button>
            )}
          </div>
        }
      />

      {selectedBills.size > 0 && canDelete && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-center gap-4 rounded-full bg-zinc-900 px-6 py-3 text-sm shadow-xl border border-zinc-700">
            <span className="font-semibold text-white">{selectedBills.size} tagihan terpilih</span>
            <div className="h-4 w-px bg-zinc-700" />
            <Button variant="danger" size="sm" className="h-8 rounded-full px-4 font-semibold" onClick={handleDeleteSelected} disabled={bulkDelete.isPending}>
              <Trash size={14} className="mr-2" /> {bulkDelete.isPending ? "Menghapus..." : "Hapus Tagihan"}
            </Button>
            <button className="text-zinc-400 hover:text-white transition-colors p-1" onClick={() => setSelectedBills(new Set())}>
              Batalkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
