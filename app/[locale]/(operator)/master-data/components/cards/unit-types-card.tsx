"use client";

import { useState, useMemo } from "react";
import { Pencil, Plus, Trash2, Loader2 } from "lucide-react";
import { Button, DataTable } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { UnitTypeFormModal } from "../modals/unit-type-form-modal";
import { CSVTools } from "../csv-import";
import type { UnitType } from "@/types/master-data";
import { useUnitTypes, useDeleteUnitType, unitTypeQK } from "@/hooks/api/use-unit-type";
import { useDebounce } from "@/hooks/use-debounce";
import { formatEffective } from "@/lib/format";

export function UnitTypesCard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data, isLoading } = useUnitTypes({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const deleteMutation = useDeleteUnitType();

  const items = data?.items || [];

  const [editing, setEditing] = useState<UnitType | null>(null);
  const [creating, setCreating] = useState(false);

  const columns: ColumnDef<UnitType>[] = useMemo(() => [
    {
      header: "Tipe",
      accessorKey: "code",
      cell: ({ row }) => <span className="font-bold text-zinc-900">{row.original.code}</span>,
    },
    {
      header: "Luas",
      accessorKey: "area_sqm",
      cell: ({ row }) => <span className="text-zinc-700">{row.original.area_sqm} m²</span>,
    },
    {
      header: "Unit",
      accessorKey: "unit_count",
      cell: ({ row }) => <span className="text-zinc-700">{row.original.unit_count} unit</span>,
    },
    // {
    //   header: "Tarif Bulanan",
    //   accessorKey: "monthly_tariff",
    //   cell: ({ row }) => (
    //     <span className="font-semibold text-zinc-900">
    //       {idr(row.original.monthly_tariff)}
    //     </span>
    //   ),
    // },
    {
      header: "Efektif",
      accessorKey: "effective_from",
      cell: ({ row }) => (
        <span className="italic text-zinc-500">
          {formatEffective(row.original.effective_from)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex justify-end gap-2 text-zinc-400">
            <button onClick={() => setEditing(t)} className="hover:text-zinc-700 transition" aria-label="Edit">
              <Pencil size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Hapus tipe ${t.code}?`)) {
                  deleteMutation.mutate(t.id);
                }
              }}
              className="text-rose-400 hover:text-rose-600 transition"
              disabled={deleteMutation.isPending}
              aria-label="Delete"
            >
              {deleteMutation.isPending && deleteMutation.variables === t.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        );
      },
    },
  ], [deleteMutation]);

  return (
    <>
      <DataTable
        title="Tipe Unit"
        data={items}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        total={data?.total || 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        actions={
          <div className="flex items-center gap-2">
            <CSVTools
              resourceLabel="Tipe Unit"
              templatePath="/api/v1/master/unit-types/csv-template"
              importPath="/api/v1/master/unit-types/import"
              templateFilename="unit-types-template.csv"
              onAfterImport={() => queryClient.invalidateQueries({ queryKey: unitTypeQK.all })}
            />
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus size={16} className="mr-1" /> Tambah Tipe
            </Button>
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


