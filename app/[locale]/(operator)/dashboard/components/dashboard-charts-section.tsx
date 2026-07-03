"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui";
import { PaymentStatusChart, TrendBarChart } from "./charts";
import { formatMonthLabel } from "@/lib/format";

export interface TrendData {
  label: string;
  total_amount: number;
  paid_amount: number;
}

interface DashboardChartsSectionProps {
  trendData: TrendData[];
  paidBills: number;
  unpaidBills: number;
  percentCollected: number;
}

export function DashboardChartsSection({
  trendData,
  paidBills,
  unpaidBills,
  percentCollected,
}: DashboardChartsSectionProps) {
  const t = useTranslations("Dashboard");

  const trend = trendData.map((d) => ({
    label: formatMonthLabel(d.label),
    tertagih: d.total_amount,
    terkumpul: d.paid_amount,
  }));

  return (
    <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
      <Card className="xl:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">
            {t("charts.billingTrend")}
          </h3>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-cream-300" />
              {t("charts.billed")}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-brand" />
              {t("charts.collected")}
            </span>
          </div>
        </div>
        <TrendBarChart data={trend} />
      </Card>

      <Card className="hover:shadow-md transition-all duration-300">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-zinc-900 leading-none mb-1">
            {t("charts.paymentStatus")}
          </h3>
          <p className="text-xs text-zinc-500">
            Distribusi pembayaran dari total {paidBills + unpaidBills} tagihan
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <PaymentStatusChart
            percent={percentCollected}
            slices={[
              { label: t("charts.paid"), value: paidBills, color: "emerald" },
              { label: t("charts.pending"), value: unpaidBills, color: "rose" },
            ]}
          />
          <div className="flex-1 w-full space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/60 hover:bg-emerald-50/80 transition-colors duration-200">
              <div className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="text-xs font-bold text-zinc-700">{t("charts.paid")}</span>
              </div>
              <span className="text-xs font-bold text-emerald-800">
                {paidBills} <span className="text-[10px] text-emerald-600 font-medium">tagihan</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/40 border border-rose-100/60 hover:bg-rose-50/80 transition-colors duration-200">
              <div className="flex items-center gap-2.5">
                <span className="h-3.5 w-3.5 rounded-full bg-rose-500 flex items-center justify-center shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                <span className="text-xs font-bold text-zinc-700">Belum</span>
              </div>
              <span className="text-xs font-bold text-rose-800">
                {unpaidBills} <span className="text-[10px] text-rose-600 font-medium">tagihan</span>
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
