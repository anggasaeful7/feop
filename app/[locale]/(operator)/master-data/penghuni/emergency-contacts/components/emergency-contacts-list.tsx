"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import type { EmergencyContact } from "@/types/emergency-contact";
import {
  useEmergencyContacts,
  useDeleteEmergencyContact,
} from "@/hooks/api/use-emergency-contacts";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { EmergencyContactFormModal } from "./modals/emergency-contacts-form-modal";

import { baseColumns } from "./columns";

export function EmergencyContactsList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data: response, isLoading } = useEmergencyContacts({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });
  const contacts = response?.items || [];

  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteMutation = useDeleteEmergencyContact();

  const columns: ColumnDef<EmergencyContact>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <DataTableRowActions
            onEdit={() => setEditing(c)}
            onDelete={() => deleteMutation.mutate(c.id)}
            isDeleting={deleteMutation.isPending && deleteMutation.variables === c.id}
            deleteConfirmMessage={`Apakah Anda yakin ingin menghapus kontak ${c.name}?`}
          />
        );
      },
    },
  ], [deleteMutation]);



  return (
    <>
      <DataTable
        title="Daftar Kontak Darurat"
        data={contacts}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        total={response?.total || 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
            <Plus size={16} className="mr-1" /> Tambah Kontak
          </Button>
        }
      />

      {creating && (
        <EmergencyContactFormModal
          title="Tambah Kontak"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <EmergencyContactFormModal
          title={`Edit ${editing.name}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
