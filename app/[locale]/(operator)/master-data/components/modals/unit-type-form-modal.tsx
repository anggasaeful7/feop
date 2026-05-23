"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { Field, Modal, inputClass } from "@/components/ui/modal";
import { ApiError } from "@/lib/axios";
import type { UnitTypePayload } from "@/types/master-data";

export function UnitTypeFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  title: string;
  initial: UnitTypePayload;
  onClose: () => void;
  onSubmit: (p: UnitTypePayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState<UnitTypePayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof UnitTypePayload>(k: K, v: UnitTypePayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          {onDelete && (
            <Button
              variant="danger"
              onClick={async () => {
                setSubmitting(true);
                try {
                  await onDelete();
                } catch (e) {
                  setError(e instanceof ApiError ? e.message : "Gagal hapus");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
            >
              <Trash2 size={14} /> Hapus
            </Button>
          )}
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Kode">
          <input
            className={inputClass}
            placeholder="Tipe 36"
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
          />
        </Field>
        <Field label="Nama">
          <input
            className={inputClass}
            placeholder="Tipe 36"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Luas (m²)">
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={form.area_sqm}
            onChange={(e) => set("area_sqm", Number(e.target.value))}
          />
        </Field>
        <Field label="Jumlah Unit">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.unit_count}
            onChange={(e) => set("unit_count", Number(e.target.value))}
          />
        </Field>
        <Field label="Tarif Bulanan (Rp)">
          <input
            type="number"
            min={0}
            step="1000"
            className={inputClass}
            value={form.monthly_tariff}
            onChange={(e) => set("monthly_tariff", Number(e.target.value))}
          />
        </Field>
        <Field label="Berlaku Sejak">
          <input
            type="date"
            className={inputClass}
            value={form.effective_from}
            onChange={(e) => set("effective_from", e.target.value)}
          />
        </Field>
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
    </Modal>
  );
}
