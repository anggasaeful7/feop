"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/format";
import type { RenovationPermit } from "@/types/renovation-permit";
import { Badge } from "@/components/ui/badge";

export const baseColumns: ColumnDef<RenovationPermit>[] = [
  {
    accessorKey: "created_at",
    header: "Tanggal Pengajuan",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {formatDateTime(row.original.created_at)}
      </div>
    ),
  },
  {
    accessorKey: "resident_name",
    header: "Pemohon & Unit",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-zinc-900">{row.original.resident_name}</div>
        <div className="text-xs text-zinc-500">Unit: {row.original.unit_code}</div>
      </div>
    ),
  },
  {
    accessorKey: "contractor_pic_name",
    header: "Kontraktor",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-zinc-900">{row.original.contractor_pic_name}</div>
        <div className="text-xs text-zinc-500">{row.original.contractor_phone}</div>
      </div>
    ),
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
