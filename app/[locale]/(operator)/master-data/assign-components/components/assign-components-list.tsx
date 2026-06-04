"use client";

import { useState, useMemo } from "react";
import { Settings2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, DataTable } from "@/components/ui";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { useUnits } from "@/hooks/api/use-unit";
import type { Unit } from "@/types/master-data";
import { baseColumns } from "../../units/components/columns";
import { AssignComponentsModal } from "./modals/assign-components-modal";

export function AssignComponentsList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const { data, error, isLoading } = useUnits({
    search: debouncedSearch,
    page,
    per_page: perPage,
  });

  const items = data?.items || [];
  const total = data?.total || 0;

  const [assigningTo, setAssigningTo] = useState<Unit | null>(null);

  const columns: ColumnDef<Unit>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => {
        const u = row.original;
        const count = u.active_components?.length || 0;

        return (
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-zinc-500 mr-2">{count} Komponen</span>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setAssigningTo(u)}
            >
              <Settings2 size={14} />
            </Button>
          </div>
        );
      },
    },
  ], []);

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Assign Komponen Tagihan"
        data={items}
        columns={columns}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        total={total}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
      />

      {assigningTo && (
        <AssignComponentsModal
          unit={assigningTo}
          onClose={() => setAssigningTo(null)}
        />
      )}
    </>
  );
}
