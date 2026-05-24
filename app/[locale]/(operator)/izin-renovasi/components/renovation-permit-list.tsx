"use client";

import { useState } from "react";
import { useRenovationPermits } from "@/hooks/api/use-renovation-permit";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./columns";
import type { RenovationPermit, RenovationPermitStatus } from "@/types/renovation-permit";
import { DetailModal } from "./modals/detail-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RenovationPermitList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [perPage] = useState(10);

  const { data, isLoading } = useRenovationPermits({
    page,
    per_page: perPage,
    search: search || undefined,
    status: status !== "all" ? (status as RenovationPermitStatus) : undefined,
  });

  const [selectedPermit, setSelectedPermit] = useState<RenovationPermit | null>(null);

  const handleViewDetail = (permit: RenovationPermit) => {
    setSelectedPermit(permit);
  };

  const closeModal = () => {
    setSelectedPermit(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={getColumns({ onDetail: handleViewDetail })}
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
        searchPlaceholder="Cari nama pemohon atau unit..."
      />

      {selectedPermit && (
        <DetailModal permit={selectedPermit} onClose={closeModal} />
      )}
    </div>
  );
}
