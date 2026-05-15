"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { Field, Modal, inputClass } from "@/components/modal";
import type { FacilityPayload, PricingMode } from "./types";

export function FacilityFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  title: string;
  initial: FacilityPayload;
  onClose: () => void;
  onSubmit: (p: FacilityPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState<FacilityPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FacilityPayload>(k: K, v: FacilityPayload[K]) =>
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
              disabled={submitting}
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
            placeholder="aula"
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
          />
        </Field>
        <Field label="Nama">
          <input
            className={inputClass}
            placeholder="Aula Serbaguna"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Mode Tarif">
          <select
            className={inputClass}
            value={form.pricing_mode}
            onChange={(e) => set("pricing_mode", e.target.value as PricingMode)}
          >
            <option value="per_session">Per Sesi</option>
            <option value="monthly">Bulanan (membership)</option>
          </select>
        </Field>
        <Field
          label={form.pricing_mode === "monthly" ? "Tarif Bulanan (Rp)" : "Tarif per Sesi (Rp)"}
        >
          <input
            type="number"
            min={0}
            step="1000"
            className={inputClass}
            value={form.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
        </Field>
        <div className="col-span-2">
          <Field label="Deskripsi (opsional)">
            <textarea
              className={inputClass + " h-20 py-2 leading-snug"}
              placeholder="Misal: kapasitas 100 orang, AC, sound system"
              value={form.description ?? ""}
              onChange={(e) =>
                set("description", e.target.value === "" ? null : e.target.value)
              }
            />
          </Field>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            id="fac-active"
            type="checkbox"
            className="h-4 w-4 accent-emerald-600"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
          />
          <label htmlFor="fac-active" className="text-sm text-zinc-700">
            Aktif (dapat dibooking warga)
          </label>
        </div>
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
    </Modal>
  );
}
