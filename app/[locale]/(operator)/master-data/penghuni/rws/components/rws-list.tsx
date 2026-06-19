"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useRws, useDeleteRw } from "@/hooks/api/use-rw";
import type { RW } from "@/types/master-data";
import { RwsFormDialog } from "./rws-form-dialog";
import { RwsBulkDialog } from "./rws-bulk-dialog";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";

export function RwsList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data, error, isLoading } = useRws({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });
  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<RW | null>(null);
  const [creating, setCreating] = useState(false);
  const [bulkCreating, setBulkCreating] = useState(false);

  const deleteRw = useDeleteRw();

  const columns: ColumnDef<RW>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <DataTableRowActions
            onEdit={() => setEditing(u)}
            onDelete={() => deleteRw.mutate(u.id)}
            isDeleting={deleteRw.isPending && deleteRw.variables === u.id}
            deleteConfirmMessage={`Hapus RW ${u.name}?`}
          />
        );
      },
    },
  ], [deleteRw]);

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar RW"
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button size="sm" variant="outline" onClick={() => setBulkCreating(true)} className="w-full sm:w-auto border-[#4F7A52] text-[#4F7A52] hover:bg-[#4F7A52]/10">
              <Plus size={16} className="mr-1" /> Tambah Massal
            </Button>
            <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
              <Plus size={16} className="mr-1" /> Tambah RW
            </Button>
          </div>
        }
      />

      {creating && (
        <RwsFormDialog
          title="Tambah RW"
          onClose={() => setCreating(false)}
        />
      )}

      {bulkCreating && (
        <RwsBulkDialog
          title="Tambah RW Secara Massal"
          onClose={() => setBulkCreating(false)}
        />
      )}

      {editing && (
        <RwsFormDialog
          title={`Edit ${editing.name}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
