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

export function RenovationPermitList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [status, setStatus] = useState<string>("all");

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
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-40 bg-[#FFFDF7]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {modalAction === "detail" && selectedPermit && (
        <DetailModal
          permit={selectedPermit}
          onClose={closeAll}
          onApprove={openApproveFromDetail}
          onReject={openRejectFromDetail}
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
