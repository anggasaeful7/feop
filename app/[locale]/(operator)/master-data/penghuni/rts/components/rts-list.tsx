"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useRts, useDeleteRt } from "@/hooks/api/use-rt";
import { useRws } from "@/hooks/api/use-rw";
import type { RT } from "@/types/master-data";
import { RtsFormDialog } from "./rts-form-dialog";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { getColumns } from "./columns";

export function RtsList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data: rwsData } = useRws({ per_page: 500 });
  const rws = useMemo(() => rwsData?.items || [], [rwsData?.items]);

  const { data, error, isLoading } = useRts({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });
  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<RT | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteRt = useDeleteRt();

  const columns: ColumnDef<RT>[] = useMemo(() => [
    ...getColumns(rws),
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <DataTableRowActions
            onEdit={() => setEditing(u)}
            onDelete={() => deleteRt.mutate(u.id)}
            isDeleting={deleteRt.isPending && deleteRt.variables === u.id}
            deleteConfirmMessage={`Hapus RT ${u.name}?`}
          />
        );
      },
    },
  ], [deleteRt, rws]);

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar RT"
        data={items}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
            <Plus size={16} className="mr-1" /> Tambah RT
          </Button>
        }
      />

      {creating && (
        <RtsFormDialog
          title="Tambah RT"
          rws={rws}
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <RtsFormDialog
          title={`Edit ${editing.name}`}
          initial={editing}
          rws={rws}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
