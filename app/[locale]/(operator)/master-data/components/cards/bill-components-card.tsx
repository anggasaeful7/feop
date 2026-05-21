"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Card, Toggle } from "@/components/ui";
import { api, ApiError } from "@/lib/axios";
import { idr } from "@/lib/format";
import type { Paged } from "@/types";
import type { BillComponent, BillComponentPayload } from "@/types/master-data";
import { BillComponentFormModal } from "../modals/bill-component-form-modal";

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


