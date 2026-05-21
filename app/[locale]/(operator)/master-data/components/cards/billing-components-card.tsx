"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Search } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { ComponentFormModal } from "../modals/component-form-modal";
import { AssignComponentModal } from "../modals/assign-component-modal";
import { dummyComponents } from "../dummy-data";
import type { BillingComponent } from "@/types/billing-dummy";
import { inputClass } from "@/components/ui/modal";

export function BillingComponentsCard() {
  const [items, setItems] = useState<BillingComponent[]>(dummyComponents);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<BillingComponent | null>(null);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-zinc-900 italic">Komponen Tagihan</h3>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              placeholder="Cari Komponen Tagihan"
              className={`${inputClass} pl-9 rounded-full bg-white`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={() => setAssigning(true)}>
            <Plus size={14} /> Asign ke unit
          </Button>
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} /> Tambah Komponen
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 bg-[#EFECE5]">
              <th className="px-4 py-3 text-left rounded-tl-lg">Nama</th>
              <th className="px-4 py-3 text-left">Desc</th>
              <th className="px-4 py-3 text-left" colSpan={2}>Harga</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((c) => (
              <tr key={c.id} className="border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-4 font-bold text-zinc-900 italic">{c.name}</td>
                <td className="px-4 py-4 text-zinc-700 italic">{c.description}</td>
                <td className="px-4 py-4 font-bold">
                  {c.price ? (
                    <span><span className="text-[10px] text-zinc-500 font-normal mr-1">Rp</span>{c.price.toLocaleString("id-ID")}</span>
                  ) : (
                    <span className="text-zinc-400">-</span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2 text-zinc-400">
                    <button onClick={() => setEditing(c)} className="hover:text-zinc-700 transition">
                      <Pencil size={16} />
                    </button>
                    <button className="text-rose-400 hover:text-rose-600 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 italic">
        <div>Showing 1-{filteredItems.length} of {filteredItems.length}</div>
        <div className="flex items-center gap-2 not-italic">
          <button className="p-1 hover:text-zinc-900">‹</button>
          <button className="w-6 h-6 rounded bg-zinc-800 text-white flex items-center justify-center">1</button>
          <button className="w-6 h-6 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">2</button>
          <button className="w-6 h-6 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">3</button>
          <span>...</span>
          <button className="w-6 h-6 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">14</button>
          <button className="p-1 hover:text-zinc-900">›</button>
        </div>
      </div>

      {creating && (
        <ComponentFormModal
          title="Tambah Komponen"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <ComponentFormModal
          title="Edit Komponen"
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {assigning && (
        <AssignComponentModal onClose={() => setAssigning(false)} />
      )}
    </Card>
  );
}


