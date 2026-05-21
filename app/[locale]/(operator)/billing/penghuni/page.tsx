"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  MessageCircle,
  Search,
  Send,
} from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/ui";

type Status = "belum" | "lunas" | "lewat" | "pending";
type Row = {
  unit: string;
  name: string;
  status: Status;
  statusLabel: string;
  outstanding?: string;
  other?: string;
  lastPaid: string;
  contact: string;
  rowDanger?: boolean;
  rowWarning?: boolean;
  action: "detail" | "tagih" | "verifikasi";
};

const rows: Row[] = [
  { unit: "A-12", name: "Pak Budi S.", status: "belum", statusLabel: "Belum", outstanding: "Rp 450.000", lastPaid: "24 Mar", contact: "0812-xxx", action: "detail" },
  { unit: "A-13", name: "Bu Sari W.", status: "lunas", statusLabel: "Lunas", other: "Iuran 17 Agt (Lunas)", lastPaid: "8 Apr", contact: "0813-xxx", action: "detail" },
  { unit: "A-14", name: "Pak Heri J.", status: "lewat", statusLabel: "Lewat 14 hari", outstanding: "Rp 450.000", lastPaid: "1 Mar", contact: "0821-xxx", rowDanger: true, action: "tagih" },
  { unit: "B-02", name: "Bu Linda", status: "pending", statusLabel: "Pending Verif", outstanding: "Rp 450.000", lastPaid: "23 Apr", contact: "0878-xxx", rowWarning: true, action: "verifikasi" },
  { unit: "B-04", name: "Bu Sari H.", status: "lunas", statusLabel: "Lunas", lastPaid: "6 Apr", contact: "0896-xxx", action: "detail" },
  { unit: "B-08", name: "Pak Rudi", status: "lewat", statusLabel: "Lewat 21 hari", outstanding: "Rp 900.000", other: "2 bln nunggak", lastPaid: "15 Feb", contact: "0815-xxx", rowDanger: true, action: "tagih" },
  { unit: "C-01", name: "Pak Ahmad", status: "lunas", statusLabel: "Lunas", lastPaid: "5 Apr", contact: "0811-xxx", action: "detail" },
  { unit: "C-08", name: "Pak Heri W.", status: "belum", statusLabel: "Belum", outstanding: "Rp 450.000", other: "Booking Aula", lastPaid: "25 Mar", contact: "0856-xxx", action: "detail" },
  { unit: "D-03", name: "Bu Nina", status: "lunas", statusLabel: "Lunas", other: "Iuran 17Agt (Lunas)", lastPaid: "3 Apr", contact: "0877-xxx", action: "detail" },
];

const FILTERS = ["Semua (120)", "Lunas (86)", "Pending (24)", "Lewat (10)"] as const;
type Filter = (typeof FILTERS)[number];

export default function BillingPenghuniPage() {
  const [filter, setFilter] = useState<Filter>("Semua (120)");
  const [q, setQ] = useState("");

  return (
    <>
      <PageHeader
        eyebrow="Admin · 120 unit"
        title="Billing Penghuni"
        subtitle="Status pembayaran per unit · Verifikasi bukti transfer"
        actions={
          <Button>
            <Send size={16} /> Kirim Reminder Massal (34)
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <Search size={16} />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari unit / nama penghuni…"
              className="h-10 w-full rounded-full border border-zinc-300 bg-white pl-9 pr-4 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="flex items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-9 rounded-full px-4 text-sm font-medium transition ${
                  filter === f
                    ? f === "Lewat (10)"
                      ? "bg-rose-700 text-white"
                      : "bg-brand-900 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Button variant="secondary" size="sm">
              <Download size={14} /> CSV
            </Button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-2 py-3 text-left">on</th>
              <th className="px-2 py-3 text-left">Unit</th>
              <th className="px-2 py-3 text-left">Penghuni</th>
              <th className="px-2 py-3 text-left">April 2026</th>
              <th className="px-2 py-3 text-left">Outstanding</th>
              <th className="px-2 py-3 text-left">Tagihan Lain</th>
              <th className="px-2 py-3 text-left">Terakhir Bayar</th>
              <th className="px-2 py-3 text-left">Kontak</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.unit}
                className={`border-t border-zinc-200/70 ${
                  r.rowDanger
                    ? "bg-row-danger/60"
                    : r.rowWarning
                      ? "bg-row-warning/60"
                      : ""
                }`}
              >
                <td className="px-2 py-4 text-zinc-500">on</td>
                <td className="px-2 py-4 font-mono text-sm font-semibold text-zinc-900">
                  {r.unit}
                </td>
                <td className="px-2 py-4 text-zinc-800">{r.name}</td>
                <td className="px-2 py-4">
                  <Badge
                    tone={
                      r.status === "lunas"
                        ? "success"
                        : r.status === "lewat"
                          ? "danger"
                          : r.status === "pending"
                            ? "warning"
                            : "warning"
                    }
                  >
                    {r.statusLabel}
                  </Badge>
                </td>
                <td className="px-2 py-4 font-semibold text-zinc-900">
                  {r.outstanding ?? "—"}
                </td>
                <td className="px-2 py-4 text-zinc-600">{r.other ?? "—"}</td>
                <td className="px-2 py-4 italic text-zinc-500">{r.lastPaid}</td>
                <td className="px-2 py-4 italic text-zinc-500">{r.contact}</td>
                <td className="px-2 py-4 text-right">
                  {r.action === "tagih" ? (
                    <Button variant="danger" size="sm">
                      <MessageCircle size={14} /> Tagih
                    </Button>
                  ) : r.action === "verifikasi" ? (
                    <Link href={`/billing/penghuni/${r.unit}/verifikasi`}>
                      <Button variant="warning" size="sm">Verifikasi</Button>
                    </Link>
                  ) : (
                    <a className="text-sm text-zinc-700 hover:underline" href="#">
                      Detail →
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <div>Showing 1–9 of 120</div>
          <div className="flex items-center gap-1">
            <button
              aria-label="Sebelumnya"
              className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100"
            >
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                className={`h-8 w-8 rounded-md text-sm ${
                  p === 1
                    ? "bg-brand-900 text-white"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {p}
              </button>
            ))}
            <span className="px-1 text-zinc-400">…</span>
            <button className="h-8 w-8 rounded-md text-zinc-700 hover:bg-zinc-100">14</button>
            <button
              aria-label="Berikutnya"
              className="grid h-8 w-8 place-items-center rounded-md text-zinc-500 hover:bg-zinc-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}
