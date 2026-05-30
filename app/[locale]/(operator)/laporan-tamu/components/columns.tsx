"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { GuestReport } from "@/types/guest-report";
import { formatDate } from "@/lib/format";

export const baseColumns: ColumnDef<GuestReport>[] = [
  {
    header: "Tanggal Kunjungan",
    accessorKey: "visit_date",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">{formatDate(row.original.visit_date)}</div>
    ),
  },
  {
    header: "Nama Tamu",
    accessorKey: "guest_name",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-zinc-900">{row.original.guest_name}</div>
        {row.original.has_ktp && (
          <div className="text-xs text-emerald-600">Ada KTP</div>
        )}
      </div>
    ),
  },
  {
    header: "Unit / Penghuni",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-zinc-900">{row.original.unit_code}</div>
        <div className="text-xs text-zinc-500">{row.original.resident_name}</div>
      </div>
    ),
  },
  {
    header: "Durasi (Hari)",
    accessorKey: "duration_days",
  },
];
