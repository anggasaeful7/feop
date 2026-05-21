"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";
import { api, ApiError } from "@/lib/axios";
import { Field, Modal, inputClass } from "@/components/ui/modal";
import { localToISOWithOffset, isoToLocal } from "@/lib/format";
import type { Paged } from "@/types";
import type { Unit } from "@/types/master-data";
import type { BookingPayload, Facility } from "@/types/facility";

type FormState = {
  facility_id: string;
  unit_id: string;
  requester_name: string;
  starts_at_local: string;
  ends_at_local: string;
  purpose: string;
  price: string; // empty string means: use facility's default
  proof_url: string;
};

function payloadToForm(p: BookingPayload): FormState {
  return {
    facility_id: p.facility_id,
    unit_id: p.unit_id ?? "",
    requester_name: p.requester_name,
    starts_at_local: isoToLocal(p.starts_at),
    ends_at_local: isoToLocal(p.ends_at),
    purpose: p.purpose ?? "",
    price: p.price === null || p.price === undefined ? "" : String(p.price),
    proof_url: p.proof_url ?? "",
  };
}

export function BookingFormModal({
  title,
  initial,
  facilities,
  onClose,
  onSubmit,
}: {
  title: string;
  initial: BookingPayload;
  facilities: Facility[];
  onClose: () => void;
  onSubmit: (p: BookingPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(payloadToForm(initial));
  const [units, setUnits] = useState<Unit[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const out = await api<Paged<Unit>>(
          "/api/v1/master/units?per_page=200",
        );
        if (!cancelled) setUnits(out.items);
      } catch {
        // unit picker is optional; silently ignore failures
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload: BookingPayload = {
        facility_id: form.facility_id,
        unit_id: form.unit_id === "" ? null : form.unit_id,
        requester_name: form.requester_name.trim(),
        starts_at: localToISOWithOffset(form.starts_at_local),
        ends_at: localToISOWithOffset(form.ends_at_local),
        purpose: form.purpose.trim() === "" ? null : form.purpose.trim(),
        price: form.price.trim() === "" ? null : Number(form.price),
        proof_url: form.proof_url.trim() === "" ? null : form.proof_url.trim(),
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
        <Field label="Fasilitas">
          <select
            className={inputClass}
            value={form.facility_id}
            onChange={(e) => set("facility_id", e.target.value)}
          >
            <option value="">— Pilih —</option>
            {facilities
              .filter((f) => f.is_active || f.id === form.facility_id)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Unit (opsional)">
          <select
            className={inputClass}
            value={form.unit_id}
            onChange={(e) => {
              const id = e.target.value;
              set("unit_id", id);
              if (form.requester_name === "" && id !== "") {
                const u = units.find((x) => x.id === id);
                if (u) {
                  const name =
                    u.resident_name ?? u.owner_name ?? `Unit ${u.code}`;
                  set("requester_name", `${u.code} · ${name}`);
                }
              }
            }}
          >
            <option value="">—</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.code} {u.resident_name ? `· ${u.resident_name}` : ""}
              </option>
            ))}
          </select>
        </Field>

        <div className="col-span-2">
          <Field label="Nama Pemohon">
            <input
              className={inputClass}
              placeholder="Pak Heri C-08"
              value={form.requester_name}
              onChange={(e) => set("requester_name", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Mulai">
          <input
            type="datetime-local"
            className={inputClass}
            value={form.starts_at_local}
            onChange={(e) => set("starts_at_local", e.target.value)}
          />
        </Field>
        <Field label="Selesai">
          <input
            type="datetime-local"
            className={inputClass}
            value={form.ends_at_local}
            onChange={(e) => set("ends_at_local", e.target.value)}
          />
        </Field>

        <div className="col-span-2">
          <Field label="Keperluan">
            <input
              className={inputClass}
              placeholder="Acara keluarga, latihan rutin, dll"
              value={form.purpose}
              onChange={(e) => set("purpose", e.target.value)}
            />
          </Field>
        </div>

        <Field label="Biaya (Rp) — kosongkan untuk pakai tarif default">
          <input
            type="number"
            min={0}
            step="1000"
            className={inputClass}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </Field>
        <Field label="URL Bukti Bayar (opsional)">
          <input
            type="url"
            className={inputClass}
            placeholder="https://…"
            value={form.proof_url}
            onChange={(e) => set("proof_url", e.target.value)}
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
