"use client";

import { useState, useMemo } from "react";
import { Plus, Link, Settings } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { GeneralFacilityFormModal } from "./modals/general-facility-form-modal";
import { AssignGeneralFacilityModal } from "./modals/assign-facility-modal";
import { PunishmentSettingsModal } from "./modals/punishment-settings-modal";
import type { GeneralFacility } from "@/types";
import {
  useGeneralFacilities,
  useDeleteGeneralFacility,
} from "@/hooks/api/use-general-facility";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function GeneralFacilityList() {
  const { data: permissions } = usePermissions();
  const canCreate = hasPermission(permissions, "general_facilities", "create");
  const canUpdate = hasPermission(permissions, "general_facilities", "update");
  const canDelete = hasPermission(permissions, "general_facilities", "delete");

  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data, isLoading } = useGeneralFacilities({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const deleteMutation = useDeleteGeneralFacility();

  const items = data?.items || [];

  const [editing, setEditing] = useState<GeneralFacility | null>(null);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const columns: ColumnDef<GeneralFacility>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            {(canUpdate || canDelete) && (
              <DataTableRowActions
                onEdit={canUpdate ? () => setEditing(t) : undefined}
                onDelete={canDelete ? () => deleteMutation.mutate(t.id) : undefined}
                isDeleting={deleteMutation.isPending && deleteMutation.variables === t.id}
                deleteConfirmMessage={`Hapus fasilitas ${t.name}?`}
              />
            )}
          </div>
        );
      },
    },
  ], [deleteMutation, canUpdate, canDelete]);

  return (
    <>
      <DataTable
        title="Daftar Fasilitas"
        data={items}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        total={data?.total || 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            {canUpdate && (
              <Button size="sm" variant="secondary" onClick={() => setShowSettings(true)} className="w-full sm:w-auto">
                <Settings size={16} className="mr-1" /> Pengaturan Punishment
              </Button>
            )}
            {canCreate && (
              <Button size="sm" variant="secondary" onClick={() => setAssigning(true)} className="w-full sm:w-auto">
                <Link size={16} className="mr-1" /> Assign ke unit
              </Button>
            )}
            {canCreate && (
              <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
                <Plus size={16} className="mr-1" /> Tambah Fasilitas
              </Button>
            )}
          </div>
        }
      />

      {creating && (
        <GeneralFacilityFormModal
          title="Tambah Fasilitas"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <GeneralFacilityFormModal
          title={`Edit ${editing.name}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {assigning && (
        <AssignGeneralFacilityModal
          onClose={() => setAssigning(false)}
        />
      )}

      {showSettings && (
        <PunishmentSettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
}
