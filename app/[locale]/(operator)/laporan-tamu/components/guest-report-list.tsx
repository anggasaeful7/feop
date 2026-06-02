"use client";

import { useState, useMemo } from "react";
import { useGuestReports } from "@/hooks/api/use-guest-report";
import { Button, DataTable } from "@/components/ui";
import { baseColumns } from "./columns";
import type { GuestReport } from "@/types/guest-report";
import { DetailModal } from "./modals/detail-modal";
import { useDebounce } from "@/hooks/use-debounce";
import { Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export function GuestReportList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [perPage] = useState(10);

  const { data, isLoading } = useGuestReports({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const [selectedReport, setSelectedReport] = useState<GuestReport | null>(null);

  const handleViewDetail = (report: GuestReport) => {
    setSelectedReport(report);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  const columns: ColumnDef<GuestReport>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetail(report)}
            title="Lihat Detail"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-4">
      <DataTable
        title="Daftar Laporan Tamu"
        columns={columns}
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
      />

      {selectedReport && (
        <DetailModal report={selectedReport} onClose={closeModal} />
      )}
    </div>
  );
}
