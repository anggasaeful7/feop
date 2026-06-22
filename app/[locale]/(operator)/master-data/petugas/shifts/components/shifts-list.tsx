"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import {
  useShifts,
  useDeleteShift,
} from "@/hooks/api/use-shift";
import type { Shift, OfficerDivision } from "@/types/master-data";
import { ShiftsFormDialog } from "./shifts-form-dialog";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function ShiftsList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [division, setDivision] = useState<string>("all");

  const { data: permissions } = usePermissions();
  const isAdmin = permissions?.role === "admin_workspace";
  const canCreate = isAdmin || hasPermission(permissions, "shifts", "create");
  const canUpdate = isAdmin || hasPermission(permissions, "shifts", "update");
  const canDelete = isAdmin || hasPermission(permissions, "shifts", "delete");

  const { data, error, isLoading } = useShifts({
    search: debouncedSearch,
    division: division === "all" ? undefined : (division as OfficerDivision),
    page,
    per_page: perPage,
  });

  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<Shift | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteShift = useDeleteShift();

  const columns: ColumnDef<Shift>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const u = row.original;
        return (
          <DataTableRowActions
            onEdit={canUpdate ? () => setEditing(u) : undefined}
            onDelete={canDelete ? () => deleteShift.mutate(u.id) : undefined}
            isDeleting={deleteShift.isPending && deleteShift.variables === u.id}
            deleteConfirmMessage={`Hapus shift ${u.name}?`}
          />
        );
      },
    },
  ], [deleteShift, canUpdate, canDelete]);

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar Shift"
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
            <Select value={division} onValueChange={setDivision}>
              <SelectTrigger className="w-full sm:w-40 rounded-full h-9 bg-white text-sm border-[#E4DDCB] italic">
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                <SelectItem value="cleaning">Kebersihan</SelectItem>
                <SelectItem value="security">Keamanan</SelectItem>
              </SelectContent>
            </Select>

            {canCreate && (
              <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
                <Plus size={16} className="mr-1" /> Tambah Shift
              </Button>
            )}
          </div>
        }
      />

      {creating && (
        <ShiftsFormDialog
          title="Tambah Shift"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <ShiftsFormDialog
          title={`Edit ${editing.name}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
