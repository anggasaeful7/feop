"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge, Button, Card } from "../ui";
import { api, ApiError } from "../api";
import type {
  BillPayer,
  Paged,
  Person,
  Unit,
  UnitPayload,
  UnitStatus,
  UnitType,
} from "./types";
import { Field, Modal, inputClass } from "./modal";
import { useList } from "./use-resource";
import { CSVTools } from "./csv-import";

const STATUS_LABEL: Record<UnitStatus, string> = {
  occupied: "Terhuni",
  vacant: "Kosong",
  maintenance: "Perbaikan",
};

const STATUS_TONE: Record<UnitStatus, "success" | "neutral" | "warning"> = {
  occupied: "success",
  vacant: "neutral",
  maintenance: "warning",
};

const PAYER_LABEL: Record<BillPayer, string> = {
  owner: "Pemilik",
  resident: "Penghuni",
};

function emptyForm(): UnitPayload {
  return {
    unit_type_id: "",
    code: "",
    block: "",
    floor: null,
    status: "vacant",
    bill_payer: "resident",
    owner_id: null,
    resident_id: null,
    notes: "",
  };
}

export function UnitsCard() {
  const { items, error, reload, setError } = useList<Unit>(
    "/api/v1/master/units?per_page=200",
  );

  const [editing, setEditing] = useState<Unit | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-zinc-900">Daftar Unit</h3>
          <p className="text-xs italic text-zinc-500">
            Pemilik, penghuni, dan siapa yang menanggung iuran tiap unit.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CSVTools
            resourceLabel="Unit"
            templatePath="/api/v1/master/units/csv-template"
            importPath="/api/v1/master/units/import"
            templateFilename="units-template.csv"
            onAfterImport={reload}
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} /> Tambah Unit
          </Button>
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
            <th className="px-2 py-3 text-left">Kode</th>
            <th className="px-2 py-3 text-left">Tipe</th>
            <th className="px-2 py-3 text-left">Pemilik</th>
            <th className="px-2 py-3 text-left">Penghuni</th>
            <th className="px-2 py-3 text-left">Bayar Iuran</th>
            <th className="px-2 py-3 text-left">Status</th>
            <th className="px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {items === null && (
            <tr>
              <td colSpan={7} className="px-2 py-6 text-center text-zinc-400">
                Memuat…
              </td>
            </tr>
          )}
          {items !== null && items.length === 0 && (
            <tr>
              <td colSpan={7} className="px-2 py-6 text-center text-zinc-400">
                Belum ada unit. Buat tipe unit di tab “Tarif IPL”, lalu klik
                “Tambah Unit”.
              </td>
            </tr>
          )}
          {items?.map((u) => {
            const ownerIsResident =
              u.owner_id != null && u.owner_id === u.resident_id;
            return (
              <tr key={u.id} className="border-t border-zinc-200/70">
                <td className="px-2 py-4">
                  <div className="font-bold text-zinc-900">{u.code}</div>
                  {u.block && (
                    <div className="text-xs italic text-zinc-500">
                      Blok {u.block}
                      {u.floor != null ? ` · Lt ${u.floor}` : ""}
                    </div>
                  )}
                </td>
                <td className="px-2 py-4 text-zinc-700">{u.unit_type_code}</td>
                <td className="px-2 py-4 text-zinc-700">
                  {u.owner_name ?? <span className="italic text-zinc-400">-</span>}
                </td>
                <td className="px-2 py-4 text-zinc-700">
                  {u.resident_name ?? (
                    <span className="italic text-zinc-400">-</span>
                  )}
                  {ownerIsResident && (
                    <span className="ml-2 text-xs italic text-zinc-500">
                      (= pemilik)
                    </span>
                  )}
                </td>
                <td className="px-2 py-4">
                  <Badge tone={u.bill_payer === "owner" ? "info" : "success"}>
                    {PAYER_LABEL[u.bill_payer]}
                  </Badge>
                </td>
                <td className="px-2 py-4">
                  <Badge tone={STATUS_TONE[u.status]}>
                    {STATUS_LABEL[u.status]}
                  </Badge>
                </td>
                <td className="px-2 py-4 text-right">
                  <button
                    onClick={() => setEditing(u)}
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {creating && (
        <UnitFormModal
          title="Tambah Unit"
          initial={emptyForm()}
          onClose={() => setCreating(false)}
          onSubmit={async (payload) => {
            await api<Unit>("/api/v1/master/units", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            setCreating(false);
            await reload();
          }}
        />
      )}

      {editing && (
        <UnitFormModal
          title={`Edit ${editing.code}`}
          initial={{
            unit_type_id: editing.unit_type_id,
            code: editing.code,
            block: editing.block ?? "",
            floor: editing.floor ?? null,
            status: editing.status,
            bill_payer: editing.bill_payer,
            owner_id: editing.owner_id ?? null,
            resident_id: editing.resident_id ?? null,
            notes: editing.notes ?? "",
          }}
          onClose={() => setEditing(null)}
          onDelete={async () => {
            if (!confirm(`Hapus unit ${editing.code}?`)) return;
            try {
              await api(`/api/v1/master/units/${editing.id}`, {
                method: "DELETE",
              });
              setEditing(null);
              await reload();
            } catch (e) {
              setError(e instanceof ApiError ? e.message : "Gagal hapus");
            }
          }}
          onSubmit={async (payload) => {
            await api<Unit>(`/api/v1/master/units/${editing.id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            });
            setEditing(null);
            await reload();
          }}
        />
      )}
    </Card>
  );
}

function UnitFormModal({
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
