"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Home, FileText, Clock, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";
import { idr, formatTimeAgo } from "@/lib/format";

export interface ActivityItem {
  type: string;
  title: string;
  subtitle: string;
  amount: number;
  created_at: string;
}

interface DashboardRecentActivityProps {
  activities: ActivityItem[];
}

function getActivityIcon(type: string): LucideIcon {
  switch (type) {
    case "resident_bill":
      return CheckCircle2;
    case "facility_booking":
      return Home;
    case "report":
      return FileText;
    default:
      return Clock;
  }
}

export function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  const t = useTranslations("Dashboard");

  const mappedActivities = activities.map((a) => {
    const Icon = getActivityIcon(a.type);
    return {
      Icon,
      text: (
        <>
          <b>{a.title}</b> &middot; {a.subtitle}
        </>
      ),
      amount: idr(a.amount),
      time: formatTimeAgo(a.created_at) || a.created_at,
    };
  });

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-1 gap-4">
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900">{t("recentActivity.title")}</h3>
        </div>
        <ul className="space-y-3">
          {mappedActivities.length > 0 ? (
            mappedActivities.map(({ Icon, ...a }, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-50"
              >
                <span className="grid h-8 w-8 place-items-center rounded-md bg-zinc-100 text-zinc-600">
                  <Icon size={16} />
                </span>
                <div className="flex-1 text-sm text-zinc-700">{a.text}</div>
                <div className="text-sm font-semibold text-zinc-800">{a.amount}</div>
                <div className="w-24 text-right text-xs text-zinc-400">{a.time}</div>
              </li>
            ))
          ) : (
            <li className="text-center text-sm text-zinc-500 py-4">Belum ada aktivitas.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
