"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2, User } from "lucide-react";
import { Button, DataTable, DataTableRowActions, Modal } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useRws, useDeleteRw, useCreateRwAdmin, useRwAdmin, useUpdateRwAdmin } from "@/hooks/api/use-rw";
import type { RW, MasterAdminPayload } from "@/types/master-data";
import { RwsFormDialog } from "./rws-form-dialog";
import { RwsBulkDialog } from "./rws-bulk-dialog";
import { MasterAdminFormDialog } from "./admin-form-dialog";
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
  const [addingAdmin, setAddingAdmin] = useState<RW | null>(null);

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
            extraActions={
              <button
                onClick={() => setAddingAdmin(u)}
                className="hover:text-[#4F7A52] text-zinc-500 transition-colors duration-200"
                title="Kelola Admin RW"
                aria-label="Kelola Admin RW"
              >
                <User size={16} />
              </button>
            }
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

      {addingAdmin && (
        <RwAdminFormDialogWrapper
          rw={addingAdmin}
          onClose={() => setAddingAdmin(null)}
        />
      )}
    </>
  );
}


interface RwAdminFormDialogWrapperProps {
  rw: RW;
  onClose: () => void;
}

function RwAdminFormDialogWrapper({ rw, onClose }: RwAdminFormDialogWrapperProps) {
  const { data: admin, isLoading } = useRwAdmin(rw.id);
  const createRwAdmin = useCreateRwAdmin();
  const updateRwAdmin = useUpdateRwAdmin();

  if (isLoading) {
    return (
      <Modal open title="Admin RW" onClose={onClose}>
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      </Modal>
    );
  }

  const isEditing = !!admin;

  const handleSubmit = (values: MasterAdminPayload) => {
    if (isEditing) {
      updateRwAdmin.mutate(
        { id: rw.id, payload: values },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createRwAdmin.mutate(
        { id: rw.id, payload: values },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    }
  };

  return (
    <MasterAdminFormDialog
      title={isEditing ? `Edit Admin RW - ${rw.name}` : `Tambah Admin RW - ${rw.name}`}
      onClose={onClose}
      isPending={isEditing ? updateRwAdmin.isPending : createRwAdmin.isPending}
      onSubmit={handleSubmit}
      initial={admin ? { email: admin.email, full_name: admin.full_name } : undefined}
      isEditing={isEditing}
    />
  );
}
