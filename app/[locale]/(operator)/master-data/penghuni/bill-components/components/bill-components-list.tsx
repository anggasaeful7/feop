"use client";

import { useState, useMemo } from "react";
import { Plus, Link } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { BillComponentsFormModal } from "./modals/bill-components-form-modal";
import { AssignComponentModal } from "./modals/assign-component-modal";
import type { BillComponent } from "@/types/master-data";
import { useBillComponents, useDeleteBillComponent } from "@/hooks/api/use-bill-component";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function BillComponentsList() {
  const { data: permissions } = usePermissions();
  const canCreate = hasPermission(permissions, "bill_components", "create");
  const canUpdate = hasPermission(permissions, "bill_components", "update");
  const canDelete = hasPermission(permissions, "bill_components", "delete");

  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data, isLoading } = useBillComponents({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });
  const deleteMutation = useDeleteBillComponent();

  const items = data?.items || [];

  const [editing, setEditing] = useState<BillComponent | null>(null);
  const [creating, setCreating] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const columns: ColumnDef<BillComponent>[] = useMemo(() => {
    const cols = [...baseColumns];
    if (canUpdate || canDelete) {
      cols.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const c = row.original;
          return (
            <DataTableRowActions
              onEdit={canUpdate ? () => setEditing(c) : undefined}
              onDelete={canDelete ? () => deleteMutation.mutate(c.id) : undefined}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === c.id}
              deleteConfirmMessage={`Apakah anda yakin ingin menghapus komponen ini?`}
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
        title="Daftar Komponen Tagihan"
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
              <Button size="sm" variant="secondary" onClick={() => setAssigning(true)} className="w-full sm:w-auto">
                <Link size={16} className="mr-1" /> Assign ke unit
              </Button>
            )}
            {canCreate && (
              <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
                <Plus size={16} className="mr-1" /> Tambah Komponen
              </Button>
            )}
          </div>
        }
      />

      {creating && (
        <BillComponentsFormModal
          title="Tambah Komponen"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <BillComponentsFormModal
          title="Edit Komponen"
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {assigning && (
        <AssignComponentModal onClose={() => setAssigning(false)} />
      )}
    </>
  );
}


