"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import {
  useUnits,
  useDeleteUnit,
} from "@/hooks/api/use-unit";
import type { Unit } from "@/types/master-data";
import { CSVTools } from "@/components/csv-import";
import { UnitFormModal } from "./modals/unit-form-modal";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";

export function UnitsList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

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
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <DataTableRowActions
            onEdit={() => setEditing(u)}
            onDelete={() => deleteUnit.mutate(u.id)}
            isDeleting={deleteUnit.isPending && deleteUnit.variables === u.id}
            deleteConfirmMessage={`Hapus unit ${u.code}?`}
          />
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
        onSearchChange={setSearch}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <CSVTools
              resourceLabel="Unit"
              templatePath="/master/units/csv-template"
              importPath="/master/units/import"
              templateFilename="units-template.csv"
              onAfterImport={() => { refetch(); }}
            />
            <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
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

