"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { UnitTypeFormModal } from "./modals/unit-type-form-modal";
import { CSVTools } from "@/components/csv-import";
import type { UnitType } from "@/types/master-data";
import { useUnitTypes, useDeleteUnitType, unitTypeQK } from "@/hooks/api/use-unit-type";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function UnitTypesList() {
  const { data: permissions } = usePermissions();
  const canCreate = hasPermission(permissions, "units", "create");
  const canUpdate = hasPermission(permissions, "units", "update");
  const canDelete = hasPermission(permissions, "units", "delete");

  const queryClient = useQueryClient();
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data, isLoading } = useUnitTypes({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const deleteMutation = useDeleteUnitType();

  const items = data?.items || [];

  const [editing, setEditing] = useState<UnitType | null>(null);
  const [creating, setCreating] = useState(false);

  const columns: ColumnDef<UnitType>[] = useMemo(() => {
    const cols = [...baseColumns];
    if (canUpdate || canDelete) {
      cols.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const t = row.original;
          return (
            <DataTableRowActions
              onEdit={canUpdate ? () => setEditing(t) : undefined}
              onDelete={canDelete ? () => deleteMutation.mutate(t.id) : undefined}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === t.id}
              deleteConfirmMessage={`Hapus tipe ${t.code}?`}
            />
          );
        },
      });
    }
    return cols;
  }, [deleteMutation, canUpdate, canDelete]);

  return (
    <>
      <DataTable
        title="Daftar Tipe Unit"
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
            {canCreate && (
              <CSVTools
                resourceLabel="Tipe Unit"
                templatePath="/master/unit-types/csv-template"
                importPath="/master/unit-types/import"
                templateFilename="unit-types-template.csv"
                onAfterImport={() => queryClient.invalidateQueries({ queryKey: unitTypeQK.all })}
              />
            )}
            {canCreate && (
              <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
                <Plus size={16} className="mr-1" /> Tambah Tipe
              </Button>
            )}
          </div>
        }
      />

      {creating && (
        <UnitTypeFormModal
          title="Tambah Tipe Unit"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <UnitTypeFormModal
          title={`Edit ${editing.code}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}


