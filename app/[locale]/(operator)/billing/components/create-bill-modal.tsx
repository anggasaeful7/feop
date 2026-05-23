"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { api, ApiError } from "@/lib/axios";
import { Field, Modal, inputClass } from "@/components/ui/modal";
import type { Paged } from "@/types";
import type { Unit } from "@/types/master-data";
import type { BillKind, ResidentBill, ResidentBillCreatePayload } from "@/types/billing";

function defaultMonthlyPeriod() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { start: fmt(start), end: fmt(end) };
}

function defaultDueDate() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 14);
  return d.toISOString().slice(0, 10);
}

export function CreateBillModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (b: ResidentBill) => void;
}) {
  const [kind, setKind] = useState<BillKind>("monthly");
  const [units, setUnits] = useState<Unit[] | null>(null);
  const [unitId, setUnitId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const monthlyDefault = defaultMonthlyPeriod();
  const [periodStart, setPeriodStart] = useState(monthlyDefault.start);
  const [periodEnd, setPeriodEnd] = useState(monthlyDefault.end);
  const [dueAt, setDueAt] = useState(defaultDueDate());
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const out = await api<Paged<Unit>>("/api/v1/master/units?per_page=200");
        if (!cancelled) setUnits(out.items);
      } catch {
        if (!cancelled) setUnits([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handle() {
    setSubmitting(true);
    setError(null);
    try {
      const payload: ResidentBillCreatePayload = {
        kind,
        title: title.trim(),
        base_amount: Number(baseAmount),
        unit_id: unitId === "" ? undefined : unitId,
        notes: notes.trim() === "" ? undefined : notes,
      };
      if (kind === "monthly") {
        payload.period_start = periodStart;
        payload.period_end = periodEnd;
      }
      if (dueAt) {
        payload.due_at = new Date(dueAt + "T23:59:59").toISOString();
      }
      const created = await api<ResidentBill>("/api/v1/resident-bills", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onCreated(created);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal membuat tagihan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      title="Buat Tagihan"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handle} disabled={submitting}>
            {submitting ? "Menyimpan…" : "Buat Tagihan"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          {(["monthly", "one_time"] as BillKind[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`h-9 flex-1 rounded-full text-sm font-medium transition ${
                kind === k
                  ? "bg-brand-900 text-white"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {k === "monthly" ? "Bulanan" : "Tertentu"}
            </button>
          ))}
        </div>

        <Field label="Unit (opsional)">
          <select
            className={inputClass}
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
          >
            <option value="">— Tidak terikat unit —</option>
            {units?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.code} · {u.bill_payer === "owner" ? u.owner_name : u.resident_name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Judul">
          <input
            className={inputClass}
            placeholder={
              kind === "monthly"
                ? "IPL Mei 2026"
                : "Iuran 17 Agt / Booking aula / dll."
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        {kind === "monthly" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Periode Mulai">
              <input
                type="date"
                className={inputClass}
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </Field>
            <Field label="Periode Akhir">
              <input
                type="date"
                className={inputClass}
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </Field>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nominal (Rp)">
            <input
              type="number"
              min={0}
              step="1000"
              className={inputClass}
              value={baseAmount}
              onChange={(e) => setBaseAmount(Number(e.target.value))}
            />
          </Field>
          <Field label="Jatuh Tempo">
            <input
              type="date"
              className={inputClass}
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Catatan">
          <input
            className={inputClass}
            placeholder="Opsional"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        <p className="text-xs italic text-zinc-500">
          Biaya platform akan ditambahkan saat pembayaran ditandai lunas.
        </p>
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
    </Modal>
  );
}
