"use client";

import { useState } from "react";
import { useGuestReports } from "@/hooks/api/use-guest-report";
import { DataTable } from "@/components/ui";
import { getColumns } from "./columns";
import type { GuestReport } from "@/types/guest-report";
import { DetailModal } from "./modals/detail-modal";

export function GuestReportList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [perPage] = useState(10);

  const { data, isLoading } = useGuestReports({
    page,
    per_page: perPage,
    search: search || undefined,
  });

  const [selectedReport, setSelectedReport] = useState<GuestReport | null>(null);

  const handleViewDetail = (report: GuestReport) => {
    setSelectedReport(report);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  return (
    <>
      <DataTable
        columns={getColumns(handleViewDetail)}
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
        searchPlaceholder="Cari nama tamu atau unit code..."
      />

      {selectedReport && (
        <DetailModal report={selectedReport} onClose={closeModal} />
      )}
    </>
  );
}
