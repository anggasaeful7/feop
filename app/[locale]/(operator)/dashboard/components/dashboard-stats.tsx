"use client";

import { useTranslations } from "next-intl";
import { Badge, Stat } from "@/components/ui";
import { idrShort } from "@/lib/format";
import { Receipt, Coins, Clock, Home } from "lucide-react";

interface DashboardStatsProps {
  totalBilled: number;
  totalCollected: number;
  totalOutstanding: number;
  totalUnits: number;
  activeUnits: number;
  totalBills: number;
  unpaidBills: number;
}

export function DashboardStats({
  totalBilled,
  totalCollected,
  totalOutstanding,
  totalUnits,
  activeUnits,
  totalBills,
  unpaidBills,
}: DashboardStatsProps) {
  const t = useTranslations("Dashboard");

  const paidBillsCount = totalBills - unpaidBills;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Stat
        label={t("stats.billed")}
        value={idrShort(totalBilled)}
        tone="default"
        icon={Receipt}
        hint={
          <span className="flex items-center gap-2">
            <Badge tone="neutral">{totalBills} tagihan</Badge>
          </span>
        }
      />
      <Stat
        label={t("stats.collected")}
        value={idrShort(totalCollected)}
        tone="success"
        icon={Coins}
        hint={
          <span className="flex items-center gap-2">
            <Badge tone="success">{paidBillsCount} tagihan</Badge>
          </span>
        }
      />
      <Stat
        label={t("stats.outstanding")}
        value={idrShort(totalOutstanding)}
        tone="danger"
        icon={Clock}
        hint={
          <span className="flex items-center gap-2">
            <Badge tone="danger">{unpaidBills} tagihan</Badge>
          </span>
        }
      />
      <Stat
        label={t("stats.activeResidents")}
        value={`${activeUnits} / ${totalUnits}`}
        tone="brand"
        icon={Home}
        hint={
          <span className="flex items-center gap-2">
            <Badge tone="neutral">{totalUnits - activeUnits} kosong</Badge>
          </span>
        }
      />
    </div>
  );
}

