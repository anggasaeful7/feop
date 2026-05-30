"use client";

import { useState, useMemo } from "react";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Button, DataTable } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { BillComponentsFormModal } from "../modals/bill-components-form-modal";
import { AssignComponentModal } from "../modals/assign-component-modal";
import type { BillComponent } from "@/types/master-data";
import { useBillComponents, useDeleteBillComponent } from "@/hooks/api/use-bill-component";
import { useDebounce } from "@/hooks/use-debounce";

export function BillComponentsCard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useBillComponents({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });
  const deleteMutation = useDeleteBillComponent();

  const items = data?.items || [];

  const [editing, setEditing] = useState<BillComponent | null>(null);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const columns: ColumnDef<BillComponent>[] = useMemo(() => [
    {
      header: "Nama",
      accessorKey: "name",
      cell: ({ row }) => <span className="font-bold text-zinc-900 italic">{row.original.name}</span>,
    },
    {
      header: "Desc",
      accessorKey: "description",
      cell: ({ row }) => <span className="text-zinc-700 italic">{row.original.description || "-"}</span>,
    },
    {
      header: "Harga",
      accessorKey: "amount",
      cell: ({ row }) => (
        <div className="font-bold">
          {row.original.amount !== null && row.original.amount !== undefined ? (
            <span><span className="text-[10px] text-zinc-500 font-normal mr-1">Rp</span>{row.original.amount.toLocaleString("id-ID")}</span>
          ) : (
            <span className="text-zinc-400">-</span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex justify-end gap-2 text-zinc-400">
            <button onClick={() => setEditing(c)} className="hover:text-zinc-700 transition">
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm("Apakah anda yakin ingin menghapus komponen ini?")) {
                  deleteMutation.mutate(c.id);
                }
              }}
              className="text-rose-400 hover:text-rose-600 transition"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && deleteMutation.variables === c.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        );
      },
    },
  ], [deleteMutation]);

  return (
    <>
      <DataTable
        title="Komponen Tagihan"
        data={items}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        total={data?.total || 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <>
            <Button size="sm" onClick={() => setAssigning(true)}>
              <Plus size={16} className="mr-1" /> Asign ke unit
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus size={16} className="mr-1" /> Tambah Komponen
            </Button>
          </>
        }
      />

      {creating && (
        <BillComponentsFormModal
          title="Tambah Komponen"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <BillComponentsFormModal
          title="Edit Komponen"
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {assigning && (
        <AssignComponentModal onClose={() => setAssigning(false)} />
      )}
    </>
  );
}


