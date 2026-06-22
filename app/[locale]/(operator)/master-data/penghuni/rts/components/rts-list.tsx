"use client";

import { useState, useMemo } from "react";
import { Plus, Loader2, User } from "lucide-react";
import { Button, DataTable, DataTableRowActions, Modal } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useRts, useDeleteRt, useCreateRtAdmin, useRtAdmin, useUpdateRtAdmin } from "@/hooks/api/use-rt";
import { useRws } from "@/hooks/api/use-rw";
import type { RT } from "@/types/master-data";
import type { MasterAdminFormValues } from "@/lib/validations/admin";
import { RtsFormDialog } from "./rts-form-dialog";
import { RtsBulkDialog } from "./rts-bulk-dialog";
import { MasterAdminFormDialog } from "../../rws/components/admin-form-dialog";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { getColumns } from "./columns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RtsList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data: rwsData } = useRws({ per_page: 500 });
  const rws = useMemo(() => rwsData?.items || [], [rwsData?.items]);

  const [rwFilter, setRwFilter] = useState<string>("all");

  const { data, error, isLoading } = useRts({
    search: debouncedSearch,
    rw_id: rwFilter === "all" ? undefined : rwFilter,
    page,
    per_page: perPage,
  });
  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<RT | null>(null);
  const [creating, setCreating] = useState(false);
  const [bulkCreating, setBulkCreating] = useState(false);
  const [addingAdmin, setAddingAdmin] = useState<RT | null>(null);

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
            extraActions={
              <button
                onClick={() => setAddingAdmin(u)}
                className="hover:text-[#4F7A52] text-zinc-500 transition-colors duration-200"
                title="Kelola Admin RT"
                aria-label="Kelola Admin RT"
              >
                <User size={16} />
              </button>
            }
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-32">
              <Select
                value={rwFilter}
                onValueChange={(val) => {
                  setRwFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full h-8 rounded-full border-zinc-300 text-xs font-semibold px-4 py-1 bg-white text-zinc-700">
                  <SelectValue placeholder="Semua RW" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua RW</SelectItem>
                  {rws.map((rw) => (
                    <SelectItem key={rw.id} value={rw.id}>
                      {rw.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={() => setBulkCreating(true)} className="w-full sm:w-auto border-[#4F7A52] text-[#4F7A52] hover:bg-[#4F7A52]/10">
              <Plus size={16} className="mr-1" /> Tambah Massal
            </Button>
            <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
              <Plus size={16} className="mr-1" /> Tambah RT
            </Button>
          </div>
        }
      />

      {creating && (
        <RtsFormDialog
          title="Tambah RT"
          rws={rws}
          onClose={() => setCreating(false)}
        />
      )}

      {bulkCreating && (
        <RtsBulkDialog
          title="Tambah RT Secara Massal"
          rws={rws}
          onClose={() => setBulkCreating(false)}
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

      {addingAdmin && (
        <RtAdminFormDialogWrapper
          rt={addingAdmin}
          onClose={() => setAddingAdmin(null)}
        />
      )}
    </>
  );
}

interface RtAdminFormDialogWrapperProps {
  rt: RT;
  onClose: () => void;
}

function RtAdminFormDialogWrapper({ rt, onClose }: RtAdminFormDialogWrapperProps) {
  const { data: admin, isLoading } = useRtAdmin(rt.id);
  const createRtAdmin = useCreateRtAdmin();
  const updateRtAdmin = useUpdateRtAdmin();

  if (isLoading) {
    return (
      <Modal open title="Admin RT" onClose={onClose}>
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      </Modal>
    );
  }

  const isEditing = !!admin;

  const handleSubmit = (values: MasterAdminFormValues) => {
    if (isEditing) {
      updateRtAdmin.mutate(
        { id: rt.id, payload: values },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createRtAdmin.mutate(
        { id: rt.id, payload: values },
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
      title={isEditing ? `Edit Admin RT - ${rt.name}` : `Tambah Admin RT - ${rt.name}`}
      onClose={onClose}
      isPending={isEditing ? updateRtAdmin.isPending : createRtAdmin.isPending}
      onSubmit={handleSubmit}
      initial={admin ? { email: admin.email, full_name: admin.full_name } : undefined}
      isEditing={isEditing}
    />
  );
}