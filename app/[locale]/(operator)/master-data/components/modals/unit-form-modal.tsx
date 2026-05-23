"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { api, ApiError } from "@/lib/axios";
import { Field, Modal, inputClass } from "@/components/ui/modal";
import type { Paged } from "@/types";
import type {
  BillPayer,
  Person,
  UnitPayload,
  UnitStatus,
  UnitType,
} from "@/types/master-data";

export function UnitFormModal({
  title,
  initial,
  onClose,
  onSubmit,
  onDelete,
}: {
  title: string;
  initial: UnitPayload;
  onClose: () => void;
  onSubmit: (p: UnitPayload) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState<UnitPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [ownerIsResident, setOwnerIsResident] = useState(
    initial.owner_id != null && initial.owner_id === initial.resident_id,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ut, p] = await Promise.all([
          api<Paged<UnitType>>("/api/v1/master/unit-types?per_page=200"),
          api<Paged<Person>>("/api/v1/master/persons?per_page=200"),
        ]);
        if (!cancelled) {
          setUnitTypes(ut.items);
          setPersons(p.items);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Gagal memuat referensi");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof UnitPayload>(k: K, v: UnitPayload[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function setOwner(id: string) {
    const owner_id = id === "" ? null : id;
    if (ownerIsResident) {
      setForm((f) => ({ ...f, owner_id, resident_id: owner_id }));
    } else {
      setForm((f) => ({ ...f, owner_id }));
    }
  }

  function setResident(id: string) {
    const resident_id = id === "" ? null : id;
    setForm((f) => ({ ...f, resident_id }));
    if (ownerIsResident && resident_id !== form.owner_id) {
      setOwnerIsResident(false);
    }
  }

  function toggleOwnerIsResident(v: boolean) {
    setOwnerIsResident(v);
    if (v) {
      setForm((f) => ({ ...f, resident_id: f.owner_id }));
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const payload: UnitPayload = {
        ...form,
        block: emptyToNull(form.block),
        floor: form.floor === null || form.floor === undefined
          ? null
          : Number(form.floor),
        notes: emptyToNull(form.notes),
        owner_id: form.owner_id || null,
        resident_id: form.resident_id || null,
      };
      if (
        payload.bill_payer === "owner" &&
        payload.owner_id == null
      ) {
        throw new ApiError(400, {
          code: "invalid_input",
          message: "Pemilik wajib diisi bila bayar iuran = pemilik",
        });
      }
      if (
        payload.bill_payer === "resident" &&
        payload.resident_id == null
      ) {
        throw new ApiError(400, {
          code: "invalid_input",
          message: "Penghuni wajib diisi bila bayar iuran = penghuni",
        });
      }
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
        <Field label="Kode Unit">
          <input
            className={inputClass}
            placeholder="A-12"
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
          />
        </Field>
        <Field label="Tipe Unit">
          <select
            className={inputClass}
            value={form.unit_type_id}
            onChange={(e) => set("unit_type_id", e.target.value)}
          >
            <option value="">— pilih tipe —</option>
            {unitTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.code} · {t.area_sqm} m²
              </option>
            ))}
          </select>
        </Field>
        <Field label="Blok">
          <input
            className={inputClass}
            placeholder="A"
            value={form.block ?? ""}
            onChange={(e) => set("block", e.target.value)}
          />
        </Field>
        <Field label="Lantai">
          <input
            type="number"
            className={inputClass}
            value={form.floor ?? ""}
            onChange={(e) =>
              set("floor", e.target.value === "" ? null : Number(e.target.value))
            }
          />
        </Field>
        <Field label="Pemilik">
          <select
            className={inputClass}
            value={form.owner_id ?? ""}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">— belum ada —</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Penghuni">
          <select
            className={inputClass}
            value={form.resident_id ?? ""}
            onChange={(e) => setResident(e.target.value)}
            disabled={ownerIsResident}
          >
            <option value="">— belum ada —</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </Field>
        <label className="col-span-2 flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={ownerIsResident}
            disabled={!form.owner_id}
            onChange={(e) => toggleOwnerIsResident(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-brand"
          />
          Pemilik tinggal sendiri di unit ini (penghuni = pemilik)
        </label>
        <Field label="Status Unit">
          <select
            className={inputClass}
            value={form.status ?? "vacant"}
            onChange={(e) => set("status", e.target.value as UnitStatus)}
          >
            <option value="occupied">Terhuni</option>
            <option value="vacant">Kosong</option>
            <option value="maintenance">Perbaikan</option>
          </select>
        </Field>
        <Field
          label="Pembayar Iuran"
          hint="Pilih pihak yang menanggung iuran IPL bulanan."
        >
          <select
            className={inputClass}
            value={form.bill_payer}
            onChange={(e) => set("bill_payer", e.target.value as BillPayer)}
          >
            <option value="resident">Penghuni</option>
            <option value="owner">Pemilik</option>
          </select>
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
