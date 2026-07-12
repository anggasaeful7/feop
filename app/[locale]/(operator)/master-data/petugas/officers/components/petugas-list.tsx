"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import {
  useOfficers,
  useDeleteOfficer,
} from "@/hooks/api/use-petugas";
import type { Officer, OfficerDivision } from "@/types/master-data";
import { PetugasFormDialog } from "./petugas-form-dialog";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function PetugasList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [division, setDivision] = useState<string>("all");

  const { data: permissions } = usePermissions();
  const isAdmin = permissions?.role === "admin_workspace";
  const canCreate = isAdmin || hasPermission(permissions, "officers", "create");
  const canUpdate = isAdmin || hasPermission(permissions, "officers", "update");
  const canDelete = isAdmin || hasPermission(permissions, "officers", "delete");

  const { data, error, isLoading } = useOfficers({
    search: debouncedSearch,
    division: division === "all" ? undefined : (division as OfficerDivision),
    page,
    per_page: perPage,
  });
  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<Officer | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteOfficer = useDeleteOfficer();

  const columns: ColumnDef<Officer>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <DataTableRowActions
            onEdit={canUpdate ? () => setEditing(u) : undefined}
            onDelete={canDelete ? () => deleteOfficer.mutate(u.id) : undefined}
            isDeleting={deleteOfficer.isPending && deleteOfficer.variables === u.id}
            deleteConfirmMessage={`Hapus petugas ${u.name}?`}
          />
        );
      },
    },
  ], [deleteOfficer, canUpdate, canDelete]);

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar Petugas"
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
            <div className="w-full sm:w-40">
              <Select value={division} onValueChange={setDivision}>
                <SelectTrigger className="w-full rounded-full h-9 bg-white text-sm border-[#E4DDCB] italic">
                  <SelectValue placeholder="Semua Divisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Divisi</SelectItem>
                  <SelectItem value="cleaning">Kebersihan</SelectItem>
                  <SelectItem value="security">Keamanan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {canCreate && (
              <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
                <Plus size={16} className="mr-1" /> Tambah Petugas
              </Button>
            )}
          </div>
        }
      />

      {creating && (
        <PetugasFormDialog
          title="Tambah Petugas"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <PetugasFormDialog
          title={`Edit ${editing.name}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
