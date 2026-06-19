"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import {
  useUnits,
  useDeleteUnit,
} from "@/hooks/api/use-unit";
import type { Unit } from "@/types/master-data";
import { CSVTools } from "@/components/csv-import";
import { UnitFormModal } from "./modals/unit-form-modal";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { baseColumns } from "./columns";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

import { useMyRts } from "@/hooks/api/use-rts";


export function UnitsList() {
  const { data: permissions } = usePermissions();
  const { data: rtsData } = useMyRts();
  const canCreate = hasPermission(permissions, "units", "create");
  const canUpdate = hasPermission(permissions, "units", "update");
  const canDelete = hasPermission(permissions, "units", "delete");

  const rtOptions = useMemo(() => {
    const base = [{ value: "all", label: "Semua RT" }];
    if (!rtsData) return base;
    const loaded = rtsData.map((item) => ({
      value: item.code,
      label: item.name,
    }));
    return [...base, ...loaded];
  }, [rtsData]);

  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const [rtFilter, setRtFilter] = useState<string>("all");

  const { data, error, isLoading, refetch } = useUnits({
    search: debouncedSearch,
    rt: rtFilter === "all" ? undefined : rtFilter,
    page,
    per_page: perPage,
  });
  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<Unit | null>(null);
  const [creating, setCreating] = useState(false);

  const deleteUnit = useDeleteUnit();

  const columns: ColumnDef<Unit>[] = useMemo(() => {
    const cols = [...baseColumns];
    if (canUpdate || canDelete) {
      cols.push({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DataTableRowActions
              onEdit={canUpdate ? () => setEditing(u) : undefined}
              onDelete={canDelete ? () => deleteUnit.mutate(u.id) : undefined}
              isDeleting={deleteUnit.isPending && deleteUnit.variables === u.id}
              deleteConfirmMessage={`Hapus unit ${u.code}?`}
            />
          );
        },
      });
    }
    return cols;
  }, [deleteUnit, canUpdate, canDelete]);

  return (
    <>
      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error.message || "Gagal memuat data"}
        </div>
      )}

      <DataTable
        title="Daftar Unit"
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
            <div className="w-full sm:w-32">
              <Select
                value={rtFilter}
                onValueChange={(val) => {
                  setRtFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full h-9 rounded-full border-zinc-300 text-xs font-semibold px-4 bg-white text-zinc-700">
                  <SelectValue placeholder="Semua RT" />
                </SelectTrigger>
                <SelectContent>
                  {rtOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {canCreate && (
              <CSVTools
                resourceLabel="Unit"
                templatePath="/master/units/csv-template"
                importPath="/master/units/import"
                templateFilename="units-template.csv"
                onAfterImport={() => { refetch(); }}
              />
            )}
            {canCreate && (
              <Button size="sm" onClick={() => setCreating(true)} className="w-full sm:w-auto">
                <Plus size={16} className="mr-1" /> Tambah Unit
              </Button>
            )}
          </div>
        }
      />

      {creating && (
        <UnitFormModal
          title="Tambah Unit"
          onClose={() => setCreating(false)}
        />
      )}

      {editing && (
        <UnitFormModal
          title={`Edit ${editing.code}`}
          initial={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

