"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { usePersons, useDeletePerson } from "@/hooks/api/use-person";
import type { Person } from "@/types/master-data";
import { CSVTools } from "@/components/csv-import";
import { ResidentFormModal } from "./modals/resident-form-modal";
import { FamilyMemberListModal } from "./family-members/family-member-list-modal";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";

export function ResidentList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data, error, isLoading, refetch } = usePersons({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });
  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<Person | null>(null);
  const [creating, setCreating] = useState(false);
  const [viewingFamily, setViewingFamily] = useState<Person | null>(null);

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
            extraActions={
              <button
                onClick={() => setViewingFamily(p)}
                className="hover:text-purple-600 transition"
                title="Anggota Keluarga"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </button>
            }
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
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <CSVTools
              resourceLabel="Warga"
              templatePath="/master/persons/csv-template"
              importPath="/master/persons/import"
              templateFilename="persons-template.csv"
              onAfterImport={() => { refetch(); }}
            />
            <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
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

      {viewingFamily && (
        <FamilyMemberListModal
          person={viewingFamily}
          onClose={() => setViewingFamily(null)}
        />
      )}
    </>
  );
}
