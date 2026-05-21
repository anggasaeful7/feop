"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { Field, Modal, inputClass } from "@/components/ui/modal";
import { ApiError } from "@/lib/axios";
import type { BillComponentPayload } from "@/types/master-data";

export function BillComponentFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  title: string;
  initial: BillComponentPayload;
  onClose: () => void;
  onSubmit: (p: BillComponentPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState<BillComponentPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof BillComponentPayload>(
    k: K,
    v: BillComponentPayload[K],
  ) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload: BillComponentPayload = {
        ...form,
        description:
          typeof form.description === "string" && form.description.trim() === ""
            ? null
            : form.description,
        amount: form.is_variable ? null : Number(form.amount ?? 0),
      };
      await onSubmit(payload);
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
      <div className="space-y-3">
        <Field label="Nama">
          <input
            className={inputClass}
            placeholder="Kebersihan"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </Field>
        <Field label="Deskripsi">
          <input
            className={inputClass}
            placeholder="Iuran kebersihan bulanan"
            value={form.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={form.is_variable}
            onChange={(e) => set("is_variable", e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-brand"
          />
          Nominal variabel per tipe (mengikuti tarif IPL)
        </label>
        {!form.is_variable && (
          <Field label="Nominal (Rp)">
            <input
              type="number"
              min={0}
              step="1000"
              className={inputClass}
              value={form.amount ?? 0}
              onChange={(e) => set("amount", Number(e.target.value))}
            />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Urutan Tampil">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.sort_order}
              onChange={(e) => set("sort_order", Number(e.target.value))}
            />
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-brand"
            />
            Aktifkan komponen
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
