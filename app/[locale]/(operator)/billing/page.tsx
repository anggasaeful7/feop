"use client";

import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Send, Loader2 } from "lucide-react";
import { Badge, Button, Card, DataTable, PageHeader } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "@/hooks/use-debounce";
import { idr } from "@/lib/format";
import {
  useSpecificBillings,
  useDeleteSpecificBilling,
} from "@/hooks/api/use-specific-billing";
import type { SpecificBilling } from "@/types/specific-billing";
import { SpecificBillingFormModal } from "./components/modals/specific-billing-form-modal";
import { IssueSpecificBillingModal } from "./components/modals/issue-specific-billing-modal";

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const perPage = 10;

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
    {
      header: "Judul",
      accessorKey: "title",
      cell: ({ row }) => (
        <>
          <div className="font-bold text-zinc-900">{row.original.title}</div>
          {row.original.description && (
            <div className="text-xs text-zinc-500">{row.original.description}</div>
          )}
        </>
      ),
    },
    {
      header: "Nominal",
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className="font-medium text-zinc-900">{idr(row.original.amount)}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: ({ row }) => (
        <Badge tone={row.original.is_active ? "success" : "neutral"}>
          {row.original.is_active ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setEditing(item)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Hapus tagihan "${item.title}"?`)) {
                  deleteBilling.mutate(item.id);
                }
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50"
              title="Hapus"
              disabled={deleteBilling.isPending}
            >
              {deleteBilling.isPending && deleteBilling.variables === item.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        );
      },
    },
  ], [deleteBilling]);

  return (
    <>
      <PageHeader
        eyebrow="Workspace · Penagihan"
        title="Manage Billing"
        subtitle="Kelola template tagihan spesifik dan generate tagihan ke unit"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIssuing(true)}>
              <Send size={16} className="mr-1" /> Generate Tagihan
            </Button>
            <Button onClick={() => setCreating(true)}>
              <Plus size={16} className="mr-1" /> Tambah Tagihan
            </Button>
          </div>
        }
      />

      <Card>
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error.message || "Gagal memuat data"}
          </div>
        )}

        <DataTable
          data={items}
          columns={columns}
          isLoading={isLoading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari tagihan..."
          total={total}
          page={page}
          perPage={perPage}
          onPageChange={setPage}
          emptyMessage="Belum ada tagihan spesifik. Klik 'Tambah Tagihan Spesifik' untuk membuat baru."
        />
      </Card>

      {creating && (
        <SpecificBillingFormModal
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <SpecificBillingFormModal
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
