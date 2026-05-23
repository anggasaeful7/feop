"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { Field, Modal, inputClass } from "@/components/ui/modal";
import { ApiError } from "@/lib/axios";
import type { PersonPayload } from "@/types/master-data";

export function PersonFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  title: string;
  initial: PersonPayload;
  onClose: () => void;
  onSubmit: (p: PersonPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState<PersonPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof PersonPayload>(k: K, v: PersonPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload: PersonPayload = {
        full_name: form.full_name,
        phone: emptyToNull(form.phone),
        email: emptyToNull(form.email),
        id_card_no: emptyToNull(form.id_card_no),
        notes: emptyToNull(form.notes),
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
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama Lengkap">
          <input
            className={inputClass}
            placeholder="Budi Santoso"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </Field>
        <Field label="No. KTP">
          <input
            className={inputClass}
            placeholder="3201xxxxxxxxx"
            value={form.id_card_no ?? ""}
            onChange={(e) => set("id_card_no", e.target.value)}
          />
        </Field>
        <Field label="Telepon">
          <input
            className={inputClass}
            placeholder="+628xxxxxxxxxx"
            value={form.phone ?? ""}
            onChange={(e) => set("phone", e.target.value)}
          />
        </Field>
        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            placeholder="warga@example.com"
            value={form.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <div className="col-span-2">
          <Field label="Catatan">
            <textarea
              className={`${inputClass} h-20 py-2`}
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
            />
          </Field>
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

function emptyToNull(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.trim();
  return t === "" ? null : t;
}
