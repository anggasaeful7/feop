"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { usePersons, useDeletePerson } from "@/hooks/api/use-person";
import type { Person } from "@/types/master-data";
import { CSVTools } from "@/components/csv-import";
import { ResidentFormModal } from "./modals/resident-form-modal";
import { baseColumns } from "./columns";

export function ResidentList() {
  const [search, setSearch] = useState("");
  
  const { data, error, isLoading, refetch } = usePersons();
  const items = data?.items || [];

  const [editing, setEditing] = useState<Person | null>(null);
  const [creating, setCreating] = useState(false);

  const deletePerson = useDeletePerson();

  const columns: ColumnDef<Person>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <DataTableRowActions
            onEdit={() => setEditing(p)}
            onDelete={() => deletePerson.mutate(p.id)}
            isDeleting={deletePerson.isPending && deletePerson.variables === p.id}
            deleteConfirmMessage={`Hapus warga ${p.full_name}?`}
          />
        );
      },
    },
  ], [deletePerson]);

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar Warga"
        data={items}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        actions={
          <div className="flex items-center gap-2">
            <CSVTools
              resourceLabel="Warga"
              templatePath="/api/v1/master/persons/csv-template"
              importPath="/api/v1/master/persons/import"
              templateFilename="persons-template.csv"
              onAfterImport={() => { refetch(); }}
            />
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus size={16} className="mr-1" /> Tambah Warga
            </Button>
          </div>
        }
      />

      {creating && (
        <ResidentFormModal
          title="Tambah Warga"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <ResidentFormModal
          title={`Edit ${editing.full_name}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
