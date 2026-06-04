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

export function BillComponentsList() {
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

  const columns: ColumnDef<BillComponent>[] = useMemo(() => [
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
            deleteConfirmMessage={`Apakah anda yakin ingin menghapus komponen ini?`}
          />
        );
      },
    },
  ], [deleteMutation]);

  return (
    <>
      <DataTable
        title="Komponen Tagihan"
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
          <>
            <Button size="sm" variant="secondary" onClick={() => setAssigning(true)}>
              <Link size={16} className="mr-1" /> Asign ke unit
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus size={16} className="mr-1" /> Tambah Komponen
            </Button>
          </>
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


