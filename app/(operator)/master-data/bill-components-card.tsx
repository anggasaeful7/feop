"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button, Card, Toggle } from "@/components/ui";
import { api, ApiError } from "@/lib/api";
import { idr } from "@/lib/format";
import { Field, Modal, inputClass } from "@/components/modal";
import type { Paged } from "@/lib/types";
import type { BillComponent, BillComponentPayload } from "./types";

const emptyForm: BillComponentPayload = {
  name: "",
  description: "",
  amount: 0,
  is_variable: false,
  is_active: true,
  sort_order: 0,
};

function describe(c: BillComponent) {
  if (c.is_variable) return c.description ?? "variabel per tipe";
  if (typeof c.amount === "number") return idr(c.amount);
  return c.description ?? "-";
}

export function BillComponentsCard() {
  const [items, setItems] = useState<BillComponent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BillComponent | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const out = await api<Paged<BillComponent>>(
        "/api/v1/master/bill-components?per_page=100",
      );
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
        const out = await api<Paged<BillComponent>>(
          "/api/v1/master/bill-components?per_page=100",
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

  async function toggle(c: BillComponent, v: boolean) {
    setItems((prev) =>
      prev?.map((p) => (p.id === c.id ? { ...p, is_active: v } : p)) ?? prev,
    );
    try {
      await api<BillComponent>(`/api/v1/master/bill-components/${c.id}/active`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: v }),
      });
    } catch (e) {
      await load();
      setError(e instanceof ApiError ? e.message : "Gagal mengubah status");
    }
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-zinc-900">Komponen Tagihan Default</h3>
      <p className="mb-4 text-xs italic text-zinc-500">
        Dipakai untuk semua cycle bulanan otomatis
      </p>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <ul className="space-y-3">
        {items === null && (
          <li className="py-2 text-sm text-zinc-400">Memuat…</li>
        )}
        {items !== null && items.length === 0 && (
          <li className="py-2 text-sm text-zinc-400">Belum ada komponen.</li>
        )}
        {items?.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 border-b border-zinc-200/60 pb-3 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-zinc-900">{c.name}</div>
              <div className="text-xs italic text-zinc-500">{describe(c)}</div>
            </div>
            <button
              onClick={() => setEditing(c)}
              aria-label="Edit"
              className="text-zinc-400 hover:text-zinc-700"
            >
              <Pencil size={14} />
            </button>
            <Toggle
              checked={c.is_active}
              onChange={(v) => void toggle(c, v)}
              ariaLabel={c.name}
            />
          </li>
        ))}
      </ul>

      <button
        onClick={() => setCreating(true)}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-full border border-zinc-300 text-sm text-zinc-700 hover:bg-zinc-50"
      >
        <Plus size={14} /> Tambah Komponen
      </button>

      {creating && (
        <BillComponentFormModal
          title="Tambah Komponen Tagihan"
          initial={emptyForm}
          onClose={() => setCreating(false)}
          onSubmit={async (payload) => {
            await api<BillComponent>("/api/v1/master/bill-components", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            setCreating(false);
            await load();
          }}
        />
      )}

      {editing && (
        <BillComponentFormModal
          title={`Edit ${editing.name}`}
          initial={{
            name: editing.name,
            description: editing.description ?? "",
            amount: editing.amount ?? 0,
            is_variable: editing.is_variable,
            is_active: editing.is_active,
            sort_order: editing.sort_order,
          }}
          onClose={() => setEditing(null)}
          onDelete={async () => {
            if (!confirm(`Hapus komponen ${editing.name}?`)) return;
            await api(`/api/v1/master/bill-components/${editing.id}`, {
              method: "DELETE",
            });
            setEditing(null);
            await load();
          }}
          onSubmit={async (payload) => {
            await api<BillComponent>(
              `/api/v1/master/bill-components/${editing.id}`,
              {
                method: "PUT",
                body: JSON.stringify(payload),
              },
            );
            setEditing(null);
            await load();
          }}
        />
      )}
    </Card>
  );
}

function BillComponentFormModal({
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
