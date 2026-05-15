"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, FileText, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { idr } from "@/lib/format";
import type { Paged } from "@/lib/types";
import { CreateBillModal } from "./create-bill-modal";
import { PayBillModal } from "./pay-bill-modal";
import type {
  BillKind,
  BillStatus,
  ProofURL,
  ResidentBill,
} from "./types";

const STATUS_LABEL: Record<BillStatus, string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
  void: "Dibatalkan",
};

const STATUS_TONE: Record<BillStatus, "warning" | "success" | "neutral"> = {
  unpaid: "warning",
  paid: "success",
  void: "neutral",
};

const KIND_LABEL: Record<BillKind, string> = {
  monthly: "Bulanan",
  one_time: "Tertentu",
};

type StatusFilter = "" | BillStatus;
type KindFilter = "" | BillKind;

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtPeriod(b: ResidentBill) {
  if (b.kind !== "monthly" || !b.period_start) return "—";
  const d = new Date(b.period_start);
  return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export default function BillingPage() {
  const [items, setItems] = useState<ResidentBill[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("unpaid");
  const [kindFilter, setKindFilter] = useState<KindFilter>("");
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState<ResidentBill | null>(null);

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ per_page: "100" });
      if (statusFilter) qs.set("status", statusFilter);
      if (kindFilter) qs.set("kind", kindFilter);
      const out = await api<Paged<ResidentBill>>(
        `/api/v1/resident-bills?${qs.toString()}`,
      );
      setItems(out.items);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat data");
    }
  }, [statusFilter, kindFilter]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const qs = new URLSearchParams({ per_page: "100" });
        if (statusFilter) qs.set("status", statusFilter);
        if (kindFilter) qs.set("kind", kindFilter);
        const out = await api<Paged<ResidentBill>>(
          `/api/v1/resident-bills?${qs.toString()}`,
        );
        if (!cancelled) setItems(out.items);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Gagal memuat data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [statusFilter, kindFilter]);

  async function viewProof(bill: ResidentBill) {
    try {
      const out = await api<ProofURL>(
        `/api/v1/resident-bills/${bill.id}/proof-url`,
      );
      window.open(out.url, "_blank", "noopener");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal membuka bukti bayar");
    }
  }

  async function handleDelete(bill: ResidentBill) {
    if (!confirm(`Hapus tagihan "${bill.title}"?`)) return;
    try {
      await api(`/api/v1/resident-bills/${bill.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menghapus");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Workspace · Penagihan"
        title="Manage Billing"
        subtitle="Tagihan bulanan dan tertentu untuk penghuni / pemilik unit"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> Buat Tagihan
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(
              [
                ["", "Semua"],
                ["unpaid", "Belum Dibayar"],
                ["paid", "Lunas"],
                ["void", "Dibatalkan"],
              ] as [StatusFilter, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setStatusFilter(v)}
                className={`h-9 rounded-full px-4 text-sm font-medium transition ${
                  statusFilter === v
                    ? "bg-brand-900 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(
              [
                ["", "Semua tipe"],
                ["monthly", "Bulanan"],
                ["one_time", "Tertentu"],
              ] as [KindFilter, string][]
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setKindFilter(v)}
                className={`h-9 rounded-full px-4 text-sm font-medium transition ${
                  kindFilter === v
                    ? "bg-zinc-900 text-white"
                    : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-3 text-left">Judul</th>
              <th className="px-3 py-3 text-left">Tipe</th>
              <th className="px-3 py-3 text-left">Periode</th>
              <th className="px-3 py-3 text-right">Tagihan</th>
              <th className="px-3 py-3 text-right">Biaya Platform</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3 text-center">Status</th>
              <th className="px-3 py-3 text-left">Jatuh Tempo</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {items === null && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-zinc-400">
                  Memuat…
                </td>
              </tr>
            )}
            {items !== null && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-sm text-zinc-400">
                  Belum ada tagihan untuk filter ini.
                </td>
              </tr>
            )}
            {items?.map((b) => (
              <tr
                key={b.id}
                className="border-t border-zinc-200/70 hover:bg-zinc-50/40"
              >
                <td className="px-3 py-3 font-semibold text-zinc-900">{b.title}</td>
                <td className="px-3 py-3 text-zinc-700">{KIND_LABEL[b.kind]}</td>
                <td className="px-3 py-3 text-zinc-700">{fmtPeriod(b)}</td>
                <td className="px-3 py-3 text-right text-zinc-800">
                  {idr(b.base_amount)}
                </td>
                <td className="px-3 py-3 text-right text-zinc-700">
                  {b.status === "paid" ? idr(b.platform_fee) : "—"}
                </td>
                <td className="px-3 py-3 text-right font-semibold text-zinc-900">
                  {b.status === "paid" ? idr(b.total_amount) : idr(b.base_amount)}
                </td>
                <td className="px-3 py-3 text-center">
                  <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                </td>
                <td className="px-3 py-3 text-zinc-700">{fmtDate(b.due_at)}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    {b.status === "unpaid" && (
                      <Button size="sm" onClick={() => setPaying(b)}>
                        <CheckCircle2 size={14} /> Tandai Lunas
                      </Button>
                    )}
                    {b.has_proof && (
                      <button
                        onClick={() => void viewProof(b)}
                        className="inline-flex h-8 items-center gap-1 rounded-full border border-zinc-300 px-3 text-xs text-zinc-700 hover:bg-zinc-50"
                        title={b.proof_file_name ?? "Bukti bayar"}
                      >
                        <FileText size={12} /> Bukti
                      </button>
                    )}
                    {b.status === "unpaid" && (
                      <button
                        onClick={() => void handleDelete(b)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {creating && (
        <CreateBillModal
          onClose={() => setCreating(false)}
          onCreated={async () => {
            setCreating(false);
            await load();
          }}
        />
      )}

      {paying && (
        <PayBillModal
          bill={paying}
          onClose={() => setPaying(null)}
          onPaid={async () => {
            setPaying(null);
            await load();
          }}
        />
      )}
    </>
  );
}
