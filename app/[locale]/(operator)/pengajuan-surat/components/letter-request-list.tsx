"use client";

import { useState, useMemo } from "react";
import { useLetterRequests } from "@/hooks/api/use-letter-request";
import { Button, DataTable } from "@/components/ui";
import { baseColumns } from "./columns";
import type { LetterRequest } from "@/types/letter-request";
import { ApproveModal } from "./modals/approve-modal";
import { RejectModal } from "./modals/reject-modal";
import { DetailModal } from "./modals/detail-modal";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function LetterRequestList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [status, setStatus] = useState<string>("all");

  const { data: permissions } = usePermissions();
  const canApprove = hasPermission(permissions, "letter_requests", "approve") || hasPermission(permissions, "letter_requests", "update");
  const canReject = hasPermission(permissions, "letter_requests", "reject") || hasPermission(permissions, "letter_requests", "update");

  const { data, isLoading } = useLetterRequests({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status: status !== "all" ? (status as "pending" | "approved" | "rejected") : undefined,
  });

  const [selectedRequest, setSelectedRequest] = useState<LetterRequest | null>(null);
  const [modalAction, setModalAction] = useState<"detail" | "approve" | "reject" | null>(null);

  const openDetail = (request: LetterRequest) => {
    setSelectedRequest(request);
    setModalAction("detail");
  };

  const closeAll = () => {
    setSelectedRequest(null);
    setModalAction(null);
  };

  // Dari detail → approve: detail hilang, approve muncul
  const openApproveFromDetail = () => setModalAction("approve");

  // Dari detail → reject: detail hilang, reject muncul
  const openRejectFromDetail = () => setModalAction("reject");

  // Dari approve/reject → kembali ke detail
  const backToDetail = () => setModalAction("detail");

  const columns: ColumnDef<LetterRequest>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => openDetail(row.original)}
          title="Lihat Detail"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
      <DataTable
        title="Daftar Pengajuan Surat"
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

      {modalAction === "detail" && selectedRequest && (
        <DetailModal
          request={selectedRequest}
          onClose={closeAll}
          onApprove={canApprove ? openApproveFromDetail : undefined}
          onReject={canReject ? openRejectFromDetail : undefined}
        />
      )}
      {modalAction === "approve" && selectedRequest && (
        <ApproveModal
          request={selectedRequest}
          onClose={closeAll}
          onBack={backToDetail}
        />
      )}
      {modalAction === "reject" && selectedRequest && (
        <RejectModal
          request={selectedRequest}
          onClose={closeAll}
          onBack={backToDetail}
        />
      )}
    </div>
  );
}
