"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { formatIDR, parseIDR } from "@/lib/utils";
import { Field, Modal, inputClass } from "@/components/ui/modal";
import type { FacilityPayload, PricingMode } from "@/types/facility";
import { useSaveFacility, useDeleteFacility } from "@/hooks/api/use-facility";

export function FacilityFormModal({
  title,
  initial,
  id,
  onClose,
}: {
  title: string;
  initial: FacilityPayload;
  id?: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FacilityPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const save = useSaveFacility();
  const remove = useDeleteFacility();

  const set = <K extends keyof FacilityPayload>(k: K, v: FacilityPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await save.mutateAsync({ id, payload: form });
      onClose();
    } catch {
      // error surfaced via toast
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    if (!confirm(`Hapus fasilitas ${form.name}?`)) return;
    setSubmitting(true);
    try {
      await remove.mutateAsync(id);
      onClose();
    } catch {
      // error surfaced via toast
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
          {id && (
            <Button variant="danger" disabled={submitting} onClick={handleDelete}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            type="text"
            inputMode="numeric"
            className={inputClass}
            value={form.price ? formatIDR(form.price) : ""}
            onChange={(e) => set("price", parseIDR(e.target.value) ?? 0)}
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
    </Modal>
  );
}
