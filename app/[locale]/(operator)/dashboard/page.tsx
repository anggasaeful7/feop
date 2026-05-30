import type { ReactNode } from "react";
import {
  ArrowUpFromLine,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Home,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Card, Button, Stat } from "@/components/ui";
import { PaymentStatusChart, TrendBarChart } from "./components/charts";

import { useTranslations } from "next-intl";

const trend = [
  { label: "Nov", tertagih: 60, terkumpul: 50 },
  { label: "Des", tertagih: 62, terkumpul: 55 },
  { label: "Jan", tertagih: 65, terkumpul: 50 },
  { label: "Feb", tertagih: 60, terkumpul: 52 },
  { label: "Mar", tertagih: 64, terkumpul: 60 },
  { label: "Apr", tertagih: 70, terkumpul: 38 },
];

export default function DashboardPage() {
  const t = useTranslations("Dashboard");

  const activities: { Icon: LucideIcon; text: ReactNode; amount: string; time: string }[] = [
    {
      Icon: CheckCircle2,
      text: <><b>A-12 · Pak Budi</b> membayar IPL April</>,
      amount: "Rp 450.000",
      time: "2 jam",
    },
    {
      Icon: CheckCircle2,
      text: <><b>B-04 · Bu Sari</b> membayar Iuran 17 Agt</>,
      amount: "Rp 50.000",
      time: "5 jam",
    },
    {
      Icon: ArrowUpFromLine,
      text: <><b>Anda</b> upload Laporan Maret</>,
      amount: "PDF 412 KB",
      time: "kemarin",
    },
    {
      Icon: Home,
      text: <><b>C-08 · Pak Heri</b> request booking Aula</>,
      amount: "Sab 27 Apr",
      time: "kemarin",
    },
  ];

  const attention = [
    { dot: "rose", text: "12 unit telat bayar > 7 hari", action: "Kirim reminder →" },
    { dot: "amber", text: "5 booking fasilitas pending", action: "Review →" },
    { dot: "amber", text: "Laporan April belum diupload", action: "Upload →" },
    { dot: "sky", text: "3 penghuni baru butuh verifikasi", action: "Verifikasi →" },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("header.eyebrow")}
        title={t("header.title")}
        subtitle={t("header.subtitle")}
        actions={
          <>
            <Button variant="secondary">
              <Calendar size={16} /> April 2026 <ChevronDown size={14} />
            </Button>
            <Button>
              <Plus size={16} /> {t("header.createBill")}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4">
        <Stat
          label={t("stats.billed")}
          value="Rp 54,0jt"
          hint={
            <span className="flex items-center gap-2">
              <Badge tone="neutral">120 unit</Badge>
              <span>Apr 2026</span>
            </span>
          }
        />
        <Stat
          label={t("stats.collected")}
          value="Rp 38,7jt"
          hint={
            <span className="flex items-center gap-2">
              <Badge tone="success">72%</Badge>
              <span>+Rp 8,4jt (7 hari)</span>
            </span>
          }
        />
        <Stat
          label={t("stats.outstanding")}
          value="Rp 15,3jt"
          hint={
            <span className="flex items-center gap-2">
              <Badge tone="warning">34 unit</Badge>
              <span>12 telat &gt;7 hari</span>
            </span>
          }
        />
        <Stat
          label={t("stats.activeResidents")}
          value="120 / 124"
          hint={
            <span className="flex items-center gap-2">
              <Badge tone="neutral">4 kosong</Badge>
              <span>2 baru bulan ini</span>
            </span>
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <Card className="col-span-2">
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

        <Card>
          <h3 className="mb-4 text-lg font-bold text-zinc-900">{t("charts.paymentStatus")}</h3>
          <div className="flex items-center gap-4">
            <PaymentStatusChart
              percent={72}
              slices={[
                { label: t("charts.paid"), value: 86, color: "emerald" },
                { label: t("charts.pending"), value: 24, color: "amber" },
                { label: t("charts.overdue"), value: 10, color: "rose" },
              ]}
            />
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-700" />
                {t("charts.paid")} <span className="ml-auto font-semibold">86 unit</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                {t("charts.pending")} <span className="ml-auto font-semibold">24 unit</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-600" />
                {t("charts.overdue")} <span className="ml-auto font-semibold">10 unit</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900">{t("recentActivity.title")}</h3>
            <a className="text-sm text-zinc-500 hover:text-zinc-800" href="#">
              {t("recentActivity.viewAll")}
            </a>
          </div>
          <ul className="space-y-3">
            {activities.map(({ Icon, ...a }, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-50"
              >
                <span className="grid h-8 w-8 place-items-center rounded-md bg-zinc-100 text-zinc-600">
                  <Icon size={16} />
                </span>
                <div className="flex-1 text-sm text-zinc-700">{a.text}</div>
                <div className="text-sm font-semibold text-zinc-800">{a.amount}</div>
                <div className="w-12 text-right text-xs text-zinc-400">{a.time}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-bold text-zinc-900">{t("attention.title")}</h3>
          <ul className="divide-y divide-zinc-200/70">
            {attention.map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-3 text-sm">
                <span
                  className={`h-2 w-2 rounded-full ${
                    a.dot === "rose"
                      ? "bg-rose-500"
                      : a.dot === "amber"
                        ? "bg-amber-500"
                        : "bg-sky-500"
                  }`}
                />
                <span className="flex-1 text-zinc-700">{a.text}</span>
                <a className="text-sm font-medium text-zinc-700 hover:underline" href="#">
                  {a.action}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
