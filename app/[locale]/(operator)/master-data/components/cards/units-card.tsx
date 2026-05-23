"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import {
  useUnits,
  useCreateUnit,
  useUpdateUnit,
  useDeleteUnit,
} from "@/hooks/api/use-unit";
import type {
  BillPayer,
  Unit,
  UnitPayload,
  UnitStatus,
} from "@/types/master-data";
import { CSVTools } from "../csv-import";
import { UnitFormModal } from "../modals/unit-form-modal";

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
  const { data, error, isPending, refetch } = useUnits({ per_page: 200 });
  const items = data?.items || [];

  const [editing, setEditing] = useState<Unit | null>(null);
  const [creating, setCreating] = useState(false);

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit(editing?.id || "");
  const deleteUnit = useDeleteUnit();

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
            onAfterImport={() => { refetch(); }}
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus size={14} /> Tambah Unit
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
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
          {isPending && (
            <tr>
              <td colSpan={7} className="px-2 py-6 text-center text-zinc-400">
                Memuat…
              </td>
            </tr>
          )}
          {!isPending && items.length === 0 && (
            <tr>
              <td colSpan={7} className="px-2 py-6 text-center text-zinc-400">
                Belum ada unit. Buat tipe unit di tab “Tarif IPL”, lalu klik
                “Tambah Unit”.
              </td>
            </tr>
          )}
          {items.map((u) => {
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
            await createUnit.mutateAsync(payload);
            setCreating(false);
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
            await deleteUnit.mutateAsync(editing.id);
            setEditing(null);
          }}
          onSubmit={async (payload) => {
            await updateUnit.mutateAsync(payload);
            setEditing(null);
          }}
        />
      )}
    </Card>
  );
}


