"use client";

import { useState, useMemo } from "react";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Badge, Button, DataTable } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import {
  useUnits,
  useDeleteUnit,
} from "@/hooks/api/use-unit";
import type {
  BillPayer,
  Unit,
  UnitStatus,
} from "@/types/master-data";
import { CSVTools } from "../csv-import";
import { UnitFormModal } from "../modals/unit-form-modal";
import { useDebounce } from "@/hooks/use-debounce";

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

export function UnitsCard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, error, isLoading, refetch } = useUnits({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });
  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<Unit | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteUnit = useDeleteUnit();

  const columns: ColumnDef<Unit>[] = useMemo(() => [
    {
      header: "Kode",
      accessorKey: "code",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <>
            <div className="font-bold text-zinc-900">{u.code}</div>
            {u.block && (
              <div className="text-xs italic text-zinc-500">
                Blok {u.block}
                {u.floor != null ? ` · Lt ${u.floor}` : ""}
              </div>
            )}
          </>
        );
      },
    },
    {
      header: "Tipe",
      accessorKey: "unit_type_code",
      cell: ({ row }) => <span className="text-zinc-700">{row.original.unit_type_code}</span>,
    },
    {
      header: "Pemilik",
      accessorKey: "owner_name",
      cell: ({ row }) => (
        <span className="text-zinc-700">
          {row.original.owner_name ?? <span className="italic text-zinc-400">-</span>}
        </span>
      ),
    },
    {
      header: "Penghuni",
      accessorKey: "resident_name",
      cell: ({ row }) => {
        const u = row.original;
        const ownerIsResident = u.owner_id != null && u.owner_id === u.resident_id;
        return (
          <span className="text-zinc-700">
            {u.resident_name ?? <span className="italic text-zinc-400">-</span>}
            {ownerIsResident && (
              <span className="ml-2 text-xs italic text-zinc-500">
                (= pemilik)
              </span>
            )}
          </span>
        );
      },
    },
    {
      header: "Bayar Iuran",
      accessorKey: "bill_payer",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Badge tone={u.bill_payer === "owner" ? "info" : "success"}>
            {PAYER_LABEL[u.bill_payer]}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <Badge tone={STATUS_TONE[u.status]}>
            {STATUS_LABEL[u.status]}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex justify-end gap-2 text-zinc-400">
            <button
              onClick={() => setEditing(u)}
              className="text-zinc-400 hover:text-zinc-700 transition"
              aria-label="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Hapus unit ${u.code}?`)) {
                  deleteUnit.mutate(u.id);
                }
              }}
              className="text-rose-400 hover:text-rose-600 transition"
              disabled={deleteUnit.isPending}
            >
              {deleteUnit.isPending && deleteUnit.variables === u.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        );
      },
    },
  ], [deleteUnit]);

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar Unit"
        data={items}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <div className="flex items-center gap-2">
            <CSVTools
              resourceLabel="Unit"
              templatePath="/api/v1/master/units/csv-template"
              importPath="/api/v1/master/units/import"
              templateFilename="units-template.csv"
              onAfterImport={() => { refetch(); }}
            />
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus size={16} className="mr-1" /> Tambah Unit
            </Button>
          </div>
        }
      />

      {creating && (
        <UnitFormModal
          title="Tambah Unit"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <UnitFormModal
          title={`Edit ${editing.code}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

