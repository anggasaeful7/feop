"use client";

import { useState, useMemo } from "react";
import { Plus, Send } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { baseColumns } from "./columns";
import {
  useSpecificBillings,
  useDeleteSpecificBilling,
} from "@/hooks/api/use-specific-billing";
import type { SpecificBilling } from "@/types/specific-billing";
import { SpecificBillingFormModal } from "./modals/specific-billing-form-modal";
import { IssueSpecificBillingModal } from "./modals/issue-specific-billing-modal";

export function BillingList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data, error, isLoading } = useSpecificBillings({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<SpecificBilling | null>(null);
  const [creating, setCreating] = useState(false);
  const [issuing, setIssuing] = useState(false);

  const deleteBilling = useDeleteSpecificBilling();

  const columns: ColumnDef<SpecificBilling>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <DataTableRowActions
            onEdit={() => setEditing(item)}
            onDelete={() => deleteBilling.mutate(item.id)}
            isDeleting={deleteBilling.isPending && deleteBilling.variables === item.id}
            deleteConfirmMessage={`Hapus tagihan "${item.title}"?`}
          />
        );
      },
    },
  ], [deleteBilling]);

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar Tagihan Lainnya"
        data={items}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        emptyMessage="Belum ada tagihan lainnya. Klik 'Tambah Tagihan' untuk membuat baru."
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setIssuing(true)}>
              <Send size={16} className="mr-1" /> Generate Tagihan
            </Button>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus size={16} className="mr-1" /> Tambah Tagihan
            </Button>
          </div>
        }
      />

      {creating && (
        <SpecificBillingFormModal
          title="Tambah Tagihan Spesifik"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <SpecificBillingFormModal
          title={`Edit ${editing.title}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}

      {issuing && (
        <IssueSpecificBillingModal
          onClose={() => setIssuing(false)}
        />
      )}
    </>
  );
}
