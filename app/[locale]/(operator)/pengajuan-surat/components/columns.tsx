"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import type { LetterRequest } from "@/types/letter-request";
import { formatDate } from "@/lib/format";

export const baseColumns: ColumnDef<LetterRequest>[] = [
  {
    header: "Tanggal",
    accessorKey: "created_at",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{formatDate(row.original.created_at)}</div>
    ),
  },
  {
    header: "Unit / Pemohon",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-zinc-900">{row.original.unit_code}</div>
        <div className="text-xs text-zinc-500">{row.original.resident_name}</div>
      </div>
    ),
  },
  {
    header: "Subjek",
    accessorKey: "subject",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (status === "approved") {
        return <Badge tone="success">Disetujui</Badge>;
      }
      if (status === "rejected") {
        return <Badge tone="danger">Ditolak</Badge>;
      }
      return <Badge tone="warning">Menunggu</Badge>;
    },
  },
];
