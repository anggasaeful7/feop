"use client";

import { useState, useMemo } from "react";
import { KeyRound, Plus } from "lucide-react";
import { Button, DataTable, DataTableRowActions } from "@/components/ui";
import { ColumnDef } from "@tanstack/react-table";
import {
  useUnits,
  useDeleteUnit,
} from "@/hooks/api/use-unit";
import type { Unit } from "@/types/master-data";
import { CSVTools } from "@/components/csv-import";
import { UnitFormModal } from "./modals/unit-form-modal";
import { ResetPasswordModal } from "./modals/reset-password-modal";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { baseColumns } from "./columns";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

import { useRts } from "@/hooks/api/use-rt";
import { useRws } from "@/hooks/api/use-rw";
import { useAuthUser } from "@/hooks/use-auth";


export function UnitsList() {
  const { data: permissions } = usePermissions();
  const user = useAuthUser();
  const isAdminRw = user?.role === "admin_rw";
  const isAdminRt = user?.role === "admin_rt";
  const canCreate = hasPermission(permissions, "units", "create");
  const canUpdate = hasPermission(permissions, "units", "update");
  const canDelete = hasPermission(permissions, "units", "delete");

  const [rwFilter, setRwFilter] = useState<string>("all");
  const [rtFilter, setRtFilter] = useState<string>("all");

  const { data: rwsData } = useRws({ per_page: 500 });
  const rws = useMemo(() => rwsData?.items || [], [rwsData?.items]);

  const selectedRwObj = useMemo(() => {
    if (rwFilter === "all" || !rwsData?.items) return null;
    return rwsData.items.find((item) => item.id === rwFilter || item.code === rwFilter) || null;
  }, [rwsData, rwFilter]);

  const { data: rtsData } = useRts({
    rw_id: isAdminRw ? user?.rw_id : selectedRwObj?.id,
    per_page: 500,
  });
  const rts = useMemo(() => rtsData?.items || [], [rtsData?.items]);

  const rwOptions = useMemo(() => {
    const base = [{ value: "all", label: "Semua RW" }];
    const seen = new Set<string>();
    const loaded: { value: string; label: string }[] = [];
    rws.forEach((item) => {
      const val = item.id || item.code;
      if (val && !seen.has(val)) {
        seen.add(val);
        loaded.push({ value: val, label: item.name || `RW ${item.code}` });
      }
    });
    return [...base, ...loaded];
  }, [rws]);

  const rtOptions = useMemo(() => {
    const base = [{ value: "all", label: "Semua RT" }];
    const seen = new Set<string>();
    const loaded: { value: string; label: string }[] = [];
    rts.forEach((item) => {
      const val = typeof item === "string" ? item : (item?.id || item?.code || "");
      const lbl = typeof item === "string" ? item : (item?.name || (item?.code ? `RT ${item.code}` : ""));
      if (val && !seen.has(val)) {
        seen.add(val);
        loaded.push({ value: val, label: lbl.startsWith("RT") ? lbl : `RT ${lbl}` });
      }
    });
    return [...base, ...loaded];
  }, [rts]);

  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();

  const effectiveRwId = isAdminRt ? user?.rw_id : isAdminRw ? user?.rw_id : rwFilter === "all" ? undefined : rwFilter;
  const effectiveRtId = isAdminRt ? user?.rt_id : rtFilter === "all" ? undefined : rtFilter;

  const { data, error, isLoading, refetch } = useUnits({
    search: debouncedSearch,
    rw_id: effectiveRwId,
    rt_id: effectiveRtId,
    page,
    per_page: perPage,
  });
  const items = data?.items || [];
  const total = data?.total || 0;

  const [editing, setEditing] = useState<Unit | null>(null);
  const [creating, setCreating] = useState(false);
  const [resetPasswordUnitId, setResetPasswordUnitId] = useState<string | null>(null);

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
              extraActions={ (
                  <button
                    onClick={() => setResetPasswordUnitId(u.id)}
                    className="hover:text-zinc-700 transition"
                    aria-label="Reset Password"
                    title="Reset Password"
                  >
                    <KeyRound size={16} />
                  </button>
                ) 
              }
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
            {!isAdminRw && !isAdminRt && (
              <div className="w-full sm:w-32">
                <Select
                  value={rwFilter}
                  onValueChange={(val) => {
                    setRwFilter(val);
                    setRtFilter("all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full h-8 rounded-full border-zinc-300 text-xs font-semibold px-4 py-1 bg-white text-zinc-700">
                    <SelectValue placeholder="Semua RW" />
                  </SelectTrigger>
                  <SelectContent>
                    {rwOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {!isAdminRt && (
              <div className="w-full sm:w-32">
                <Select
                  disabled={!isAdminRw && rwFilter === "all"}
                  value={rtFilter}
                  onValueChange={(val) => {
                    setRtFilter(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full h-8 rounded-full border-zinc-300 text-xs font-semibold px-4 py-1 bg-white text-zinc-700 disabled:opacity-40">
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
            )}
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

      {resetPasswordUnitId && (
        <ResetPasswordModal
          unitId={resetPasswordUnitId}
          onClose={() => setResetPasswordUnitId(null)}
        />
      )}
    </>
  );
}
