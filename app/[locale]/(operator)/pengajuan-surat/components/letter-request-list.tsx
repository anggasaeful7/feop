"use client";

import { useState } from "react";
import { useLetterRequests } from "@/hooks/api/use-letter-request";
import { DataTable } from "@/components/ui";
import { getColumns } from "./columns";
import type { LetterRequest } from "@/types/letter-request";
import { ApproveModal } from "./modals/approve-modal";
import { RejectModal } from "./modals/reject-modal";
import { DetailModal } from "./modals/detail-modal";

export function LetterRequestList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | undefined>();
  const [perPage] = useState(10);

  const { data, isLoading } = useLetterRequests({
    page,
    per_page: perPage,
    search: search || undefined,
    status,
  });

  const [selectedRequest, setSelectedRequest] = useState<LetterRequest | null>(null);
  const [modalAction, setModalAction] = useState<"detail" | "approve" | "reject" | null>(null);

  const handleAction = (request: LetterRequest, action: "detail" | "approve" | "reject") => {
    setSelectedRequest(request);
    setModalAction(action);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalAction(null);
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        {(["pending", "approved", "rejected", undefined] as const).map((s) => (
          <button
            key={s ?? "all"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`h-8 rounded-full px-4 text-xs font-semibold transition ${status === s
              ? "bg-brand-900 text-white"
              : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : "Semua"}
          </button>
        ))}
      </div>

      <DataTable
        columns={getColumns(handleAction)}
        data={data?.items ?? []}
        isLoading={isLoading}
        total={data?.total ?? 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Cari subject, unit code, atau resident..."
      />

      {modalAction === "detail" && selectedRequest && (
        <DetailModal request={selectedRequest} onClose={closeModal} />
      )}
      {modalAction === "approve" && selectedRequest && (
        <ApproveModal request={selectedRequest} onClose={closeModal} />
      )}
      {modalAction === "reject" && selectedRequest && (
        <RejectModal request={selectedRequest} onClose={closeModal} />
      )}
    </>
  );
}
