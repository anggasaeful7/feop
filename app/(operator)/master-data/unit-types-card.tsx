"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { idr, formatEffective } from "@/lib/format";
import { Field, Modal, inputClass } from "@/components/modal";
import type { Paged } from "@/lib/types";
import type { UnitType, UnitTypePayload } from "./types";
import { CSVTools } from "./csv-import";

const emptyForm: UnitTypePayload = {
  code: "",
  name: "",
  area_sqm: 0,
  unit_count: 0,
  monthly_tariff: 0,
  effective_from: new Date().toISOString().slice(0, 10),
};

export function UnitTypesCard() {
  const [items, setItems] = useState<UnitType[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<UnitType | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const out = await api<Paged<UnitType>>("/api/v1/master/unit-types?per_page=100");
      setItems(out.items);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat data");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const out = await api<Paged<UnitType>>(
          "/api/v1/master/unit-types?per_page=100",
        );
        if (!cancelled) setItems(out.items);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Gagal memuat data");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="col-span-3">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-zinc-900">Tarif IPL per Tipe Unit</h3>
        <div className="flex items-center gap-2">
          <CSVTools
            resourceLabel="Tipe Unit"
            templatePath="/api/v1/master/unit-types/csv-template"
            importPath="/api/v1/master/unit-types/import"
            templateFilename="unit-types-template.csv"
            onAfterImport={load}
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} /> Tambah Tipe
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
            <th className="px-2 py-3 text-left">Tipe</th>
            <th className="px-2 py-3 text-left">Luas</th>
            <th className="px-2 py-3 text-left">Unit</th>
            <th className="px-2 py-3 text-left">Tarif Bulanan</th>
            <th className="px-2 py-3 text-left">Efektif</th>
            <th className="px-2 py-3" />
          </tr>
        </thead>
        <tbody>
          {items === null && (
            <tr>
              <td colSpan={6} className="px-2 py-6 text-center text-zinc-400">
                Memuat…
              </td>
            </tr>
          )}
          {items !== null && items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-2 py-6 text-center text-zinc-400">
                Belum ada tipe unit. Klik “Tambah Tipe”.
              </td>
            </tr>
          )}
          {items?.map((t) => (
            <tr key={t.id} className="border-t border-zinc-200/70">
              <td className="px-2 py-4 font-bold text-zinc-900">{t.code}</td>
              <td className="px-2 py-4 text-zinc-700">{t.area_sqm} m²</td>
              <td className="px-2 py-4 text-zinc-700">{t.unit_count} unit</td>
              <td className="px-2 py-4 font-semibold text-zinc-900">
                {idr(t.monthly_tariff)}
              </td>
              <td className="px-2 py-4 italic text-zinc-500">
                {formatEffective(t.effective_from)}
              </td>
              <td className="px-2 py-4 text-right">
                <button
                  onClick={() => setEditing(t)}
                  className="text-zinc-400 hover:text-zinc-700"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {creating && (
        <UnitTypeFormModal
          title="Tambah Tipe Unit"
          initial={emptyForm}
          onClose={() => setCreating(false)}
          onSubmit={async (payload) => {
            await api<UnitType>("/api/v1/master/unit-types", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            setCreating(false);
            await load();
          }}
        />
      )}

      {editing && (
        <UnitTypeFormModal
          title={`Edit ${editing.code}`}
          initial={{
            code: editing.code,
            name: editing.name,
            area_sqm: editing.area_sqm,
            unit_count: editing.unit_count,
            monthly_tariff: editing.monthly_tariff,
            effective_from: editing.effective_from,
          }}
          onClose={() => setEditing(null)}
          onDelete={async () => {
            if (!confirm(`Hapus tipe ${editing.code}?`)) return;
            await api(`/api/v1/master/unit-types/${editing.id}`, {
              method: "DELETE",
            });
            setEditing(null);
            await load();
          }}
          onSubmit={async (payload) => {
            await api<UnitType>(`/api/v1/master/unit-types/${editing.id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            });
            setEditing(null);
            await load();
          }}
        />
      )}
    </Card>
  );
}

function UnitTypeFormModal({
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
