"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useTranslations } from "next-intl";
import { useDashboard } from "@/hooks/api/use-dashboard";
import { useAuthUser } from "@/hooks/use-auth";
import { useRts } from "@/hooks/api/use-rt";
import { useRws } from "@/hooks/api/use-rw";

import { DashboardFilters } from "./components/dashboard-filters";
import { DashboardStats } from "./components/dashboard-stats";
import { DashboardChartsSection } from "./components/dashboard-charts-section";
import { DashboardRecentActivity } from "./components/dashboard-recent-activity";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const user = useAuthUser();

  const [rwFilter, setRwFilter] = useState<string>("all");
  const [rtFilter, setRtFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | null>(new Date());
  const [onlyOverdue, setOnlyOverdue] = useState<boolean>(false);

  const isAdminRw = user?.role === "admin_rw";
  const isAdminRt = user?.role === "admin_rt";

  const { data: rwsData } = useRws({ per_page: 500 });
  const rws = useMemo(() => rwsData?.items || [], [rwsData?.items]);

  const selectedRwObj = useMemo(() => {
    if (rwFilter === "all" || !rwsData?.items) return null;
    return rwsData.items.find((item) => item.code === rwFilter) || null;
  }, [rwsData, rwFilter]);

  const { data: rtsData } = useRts({
    rw_id: isAdminRw ? user?.rw_id : selectedRwObj?.id,
    per_page: 200,
  });

  const rts = useMemo(() => rtsData?.items || [], [rtsData?.items]);

  const rwOptions = useMemo(() => {
    const base = [{ value: "all", label: "Semua RW" }];
    const seen = new Set<string>();
    const loaded: { value: string; label: string }[] = [];
    rws.forEach((item) => {
      const val = item.code;
      if (val && !seen.has(val)) {
        seen.add(val);
        loaded.push({
          value: val,
          label: item.name || `RW ${val}`,
        });
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
        loaded.push({
          value: val,
          label: val.startsWith("RT") ? val : `RT ${val}`,
        });
      }
    });
    return [...base, ...loaded];
  }, [rts]);

  const overdue_months = onlyOverdue ? user?.punishment_months : undefined;

  // Fetch dashboard data
  const { data, isLoading } = useDashboard({
    rw: (isAdminRw || isAdminRt) ? user?.rw : (rwFilter === "all" ? undefined : rwFilter),
    rt: isAdminRt ? user?.rt : (rtFilter === "all" ? undefined : rtFilter),
    month: dateFilter ? dateFilter.getMonth() + 1 : undefined,
    year: dateFilter ? dateFilter.getFullYear() : undefined,
    overdue_months,
  });

  // Derived metrics
  const totalBilled = data?.billing_summary.total_amount || 0;
  const totalCollected = data?.billing_summary.paid_amount || 0;
  const totalOutstanding = data?.billing_summary.unpaid_amount || 0;

  const totalUnits = data?.unit_summary.total_units || 0;
  const activeUnits = data?.unit_summary.active_units || 0;

  const paidBills = data?.payment_status.sudah_bayar || 0;
  const unpaidBills = data?.payment_status.belum_bayar || 0;
  const totalBills = data?.payment_status.total || 0;
  const percentCollected = totalBills > 0 ? Math.round((paidBills / totalBills) * 100) : 0;

  const filters = (
    <DashboardFilters
      isAdminRw={isAdminRw}
      isAdminRt={isAdminRt}
      punishmentMonths={user?.punishment_months || 0}
      rwFilter={rwFilter}
      setRwFilter={setRwFilter}
      rwOptions={rwOptions}
      rtFilter={rtFilter}
      setRtFilter={setRtFilter}
      rtOptions={rtOptions}
      dateFilter={dateFilter}
      setDateFilter={setDateFilter}
      onlyOverdue={onlyOverdue}
      setOnlyOverdue={setOnlyOverdue}
    />
  );

  return (
    <>
      <PageHeader
        title={t("header.title")}
        subtitle={t("header.subtitle")}
        actions={filters}
      />

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {/* Stats Skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-36 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>

          {/* Charts Skeletons */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-48 mb-6" />
              <Skeleton className="h-[280px] w-full" />
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-6 w-48 mb-6" />
              <Skeleton className="h-[280px] w-full" />
            </div>
          </div>

          {/* Activities Skeletons */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <DashboardStats
            totalBilled={totalBilled}
            totalCollected={totalCollected}
            totalOutstanding={totalOutstanding}
            totalUnits={totalUnits}
            activeUnits={activeUnits}
            totalBills={totalBills}
            unpaidBills={unpaidBills}
          />

          <DashboardChartsSection
            trendData={data?.billing_trend || []}
            paidBills={paidBills}
            unpaidBills={unpaidBills}
            percentCollected={percentCollected}
          />

          <DashboardRecentActivity activities={data?.recent_activity || []} />
        </>
      )}
    </>
  );
}
