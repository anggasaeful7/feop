"use client";

import { useState, useMemo } from "react";
import { useRenovationPermits } from "@/hooks/api/use-renovation-permit";
import { Button, DataTable } from "@/components/ui";
import { baseColumns } from "./columns";
import type { RenovationPermit, RenovationPermitStatus } from "@/types/renovation-permit";
import { DetailModal } from "./modals/detail-modal";
import { ApproveModal } from "./modals/approve-modal";
import { RejectModal } from "./modals/reject-modal";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function RenovationPermitList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [status, setStatus] = useState<string>("all");

  const { data: permissions } = usePermissions();
  const canApprove = hasPermission(permissions, "renovation_permits", "approve") || hasPermission(permissions, "renovation_permits", "update");
  const canReject = hasPermission(permissions, "renovation_permits", "reject") || hasPermission(permissions, "renovation_permits", "update");

  const { data, isLoading } = useRenovationPermits({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status: status !== "all" ? (status as RenovationPermitStatus) : undefined,
  });

  const [selectedPermit, setSelectedPermit] = useState<RenovationPermit | null>(null);
  const [modalAction, setModalAction] = useState<"detail" | "approve" | "reject" | null>(null);

  const openDetail = (permit: RenovationPermit) => {
    setSelectedPermit(permit);
    setModalAction("detail");
  };

  const closeAll = () => {
    setSelectedPermit(null);
    setModalAction(null);
  };

  const openApproveFromDetail = () => setModalAction("approve");
  const openRejectFromDetail = () => setModalAction("reject");
  const backToDetail = () => setModalAction("detail");

  const columns: ColumnDef<RenovationPermit>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDetail(row.original)}
            title="Lihat Detail"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <DataTable
        title="Daftar Izin Renovasi"
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        total={data?.total ?? 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        actions={
          <div className="w-full sm:w-40">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full h-9 rounded-lg border-zinc-200 text-xs font-medium bg-zinc-50 text-zinc-800">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {modalAction === "detail" && selectedPermit && (
        <DetailModal
          permit={selectedPermit}
          onClose={closeAll}
          onApprove={canApprove ? openApproveFromDetail : undefined}
          onReject={canReject ? openRejectFromDetail : undefined}
        />
      )}
      {modalAction === "approve" && selectedPermit && (
        <ApproveModal
          permit={selectedPermit}
          onClose={closeAll}
          onBack={backToDetail}
        />
      )}
      {modalAction === "reject" && selectedPermit && (
        <RejectModal
          permit={selectedPermit}
          onClose={closeAll}
          onBack={backToDetail}
        />
      )}
    </div>
  );
}
