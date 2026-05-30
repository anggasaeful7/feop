"use client";

import { useState } from "react";
import { Pencil, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Card, Toggle } from "@/components/ui";

const initialReminders = [
  {
    id: "h-7",
    title: "H-7 Reminder",
    sub: "7 hari sebelum jatuh tempo",
    on: true,
    template: '"Halo [Nama], tagihan IPL [Bulan] Rp [Jumlah] jatuh tempo [Tgl]. Yuk bayar ya🙏"',
  },
  {
    id: "h-3",
    title: "H-3 Reminder",
    sub: "3 hari sebelum",
    on: true,
    template: '"Halo [Nama], 3 hari lagi jatuh tempo IPL [Bulan]. Klik link bayar: [Link]"',
  },
  {
    id: "h-1",
    title: "H-1 Urgent",
    sub: "1 hari sebelum",
    on: true,
    template: '"[Nama], besok jatuh tempo IPL [Bulan]. Mohon segera bayar Rp [Jumlah]."',
  },
  {
    id: "h+7",
    title: "H+7 Lewat",
    sub: "7 hari setelah",
    on: true,
    template: '"[Nama], IPL [Bulan] sudah lewat 7 hari. Mohon perhatiannya."',
  },
  {
    id: "h+14",
    title: "H+14 Escalation",
    sub: "14 hari setelah + cc RT",
    on: false,
    template: '"[Nama], IPL [Bulan] sudah lewat 14 hari. Mohon hubungi Pak RT."',
  },
];

const blasts = [
  { title: "H-7 April auto", meta: "34 WA · 72% terbaca", time: "2 hari" },
  { title: "Laporan Maret", meta: "120 push · 98% open", time: "30 Mar" },
  { title: "Reminder khusus", meta: "8 WA · manual", time: "28 Mar" },
];

export default function NotifikasiPage() {
  const [reminders, setReminders] = useState(initialReminders);
  const [channel, setChannel] = useState<"WhatsApp" | "Email">("WhatsApp");

  return (
    <>
      <PageHeader
        eyebrow="Admin · Automation"
        title="Notifikasi & Reminder"
        subtitle="Atur template push + WhatsApp dan jadwal blast"
      />

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <h3 className="text-xl font-bold text-zinc-900">Auto-Reminder Bulanan</h3>
          <p className="mb-4 text-xs italic text-zinc-500">
            Kirim otomatis ke penghuni yang belum bayar
          </p>
          <ul className="space-y-3">
            {reminders.map((r, i) => (
              <li
                key={r.id}
                className={`rounded-xl border border-zinc-200/70 p-4 ${
                  r.on ? "bg-white" : "bg-cream-100/60 opacity-90"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={r.on}
                      onChange={(v) =>
                        setReminders((prev) =>
                          prev.map((p, j) =>
                            i === j ? { ...p, on: v } : p,
                          ),
                        )
                      }
                      ariaLabel={r.title}
                    />
                    <div className="leading-tight">
                      <div className="font-bold text-zinc-900">{r.title}</div>
                      <div className="text-xs italic text-zinc-500">{r.sub}</div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    <Pencil size={14} /> Edit
                  </Button>
                </div>
                <div className="mt-3 rounded-md bg-cream-100 px-3 py-2 text-sm italic text-zinc-700">
                  {r.template}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-xl font-bold text-zinc-900">Kirim Blast Manual</h3>
            <p className="mb-4 text-xs italic text-zinc-500">
              Broadcast ke semua / sebagian penghuni
            </p>

            <Field label="PENERIMA">
              <select className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm">
                <option>Penghuni belum bayar April (34 unit)</option>
                <option>Semua penghuni</option>
              </select>
            </Field>

            <div className="mt-4">
              <Field label="CHANNEL">
                <div className="flex gap-2">
                  {(["WhatsApp", "Email"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setChannel(c)}
                      className={`h-9 rounded-full px-4 text-sm ${
                        channel === c
                          ? "bg-emerald-200 text-emerald-900"
                          : "border border-zinc-300 bg-white text-zinc-700"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="mt-4">
              <Field label="PESAN">
                <textarea
                  rows={4}
                  className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 text-sm"
                />
              </Field>
            </div>

            <button className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white hover:bg-brand-700">
              <Send size={16} /> Kirim ke 34 Penghuni
            </button>
          </Card>

          <Card>
            <h3 className="mb-3 text-lg font-bold text-zinc-900">Riwayat Blast</h3>
            <ul className="space-y-3">
              {blasts.map((b) => (
                <li key={b.title} className="flex items-start justify-between text-sm">
                  <div className="leading-tight">
                    <div className="font-semibold text-zinc-900">{b.title}</div>
                    <div className="text-xs italic text-zinc-500">{b.meta}</div>
                  </div>
                  <div className="text-xs italic text-zinc-500">{b.time}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold tracking-wider text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}
