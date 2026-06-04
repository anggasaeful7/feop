"use client";

import { useState, useMemo } from "react";
import { useComplaints } from "@/hooks/api/use-complaint";
import { Button, DataTable } from "@/components/ui";
import { baseColumns } from "./columns";
import type { Complaint } from "@/types/complaint";
import { DetailModal } from "./modals/detail-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { Pencil } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

export function ComplaintList() {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } = useDataTableState();
  const [status, setStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const { data, isLoading } = useComplaints({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status: status !== "all" ? status : undefined,
    category: category !== "all" ? category : undefined,
  });

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const handleViewDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeModal = () => {
    setSelectedComplaint(null);
  };

  const columns: ColumnDef<Complaint>[] = useMemo(() => [
    ...baseColumns,
    {
      id: "actions",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewDetail(c)}
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
        title="Daftar Laporan"
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
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-40 bg-[#FFFDF7]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="open">Baru</SelectItem>
                <SelectItem value="in_progress">Diproses</SelectItem>
                <SelectItem value="resolved">Selesai</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
                <SelectItem value="closed">Ditutup</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger className="w-40 bg-[#FFFDF7]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="fasilitas_umum">Fasilitas Umum</SelectItem>
                <SelectItem value="kebersihan">Kebersihan</SelectItem>
                <SelectItem value="keamanan">Keamanan</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      {selectedComplaint && (
        <DetailModal complaint={selectedComplaint} onClose={closeModal} />
      )}
    </div>
  );
}
