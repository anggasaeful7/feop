import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui";
import { Eye } from "lucide-react";
import type { GuestReport } from "@/types/guest-report";
import { formatDate } from "@/lib/format";

export const getColumns = (
  onViewDetail: (report: GuestReport) => void
): ColumnDef<GuestReport>[] => [
  {
    header: "Tanggal Kunjungan",
    accessorKey: "visit_date",
    cell: ({ row }) => formatDate(row.original.visit_date),
  },
  {
    header: "Nama Tamu",
    accessorKey: "guest_name",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.original.guest_name}</div>
        {row.original.has_ktp && <div className="text-xs text-emerald-600">Ada KTP</div>}
      </div>
    )
  },
  {
    header: "Unit / Penghuni",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.original.unit_code}</div>
        <div className="text-zinc-500">{row.original.resident_name}</div>
      </div>
    ),
  },
  {
    header: "Durasi (Hari)",
    accessorKey: "duration_days",
  },
  {
    header: "Aksi",
    id: "actions",
    cell: ({ row }) => {
      const report = row.original;
      return (
        <Button variant="ghost" size="sm" onClick={() => onViewDetail(report)} title="Detail">
          <Eye size={16} /> Detail
        </Button>
      );
    },
  },
];
