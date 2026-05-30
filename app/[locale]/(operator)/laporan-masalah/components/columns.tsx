"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Complaint } from "@/types/complaint";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import {
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_STATUS_TONE,
  COMPLAINT_URGENCY_LABEL,
  COMPLAINT_URGENCY_TONE,
} from "@/lib/constants";

export const baseColumns: ColumnDef<Complaint>[] = [
  {
    accessorKey: "created_at",
    header: "Tanggal",
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {formatDateTime(row.original.created_at)}
      </div>
    ),
  },
  {
    accessorKey: "resident_name",
    header: "Penghuni & Unit",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-zinc-900">{row.original.resident_name}</div>
        <div className="text-xs text-zinc-500">Unit: {row.original.unit_code}</div>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: "Judul Masalah",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate font-medium">
        {row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => (
      <div className="capitalize">{row.original.category.replace(/_/g, " ")}</div>
    ),
  },
  {
    accessorKey: "urgency",
    header: "Urgensi",
    cell: ({ row }) => {
      const urgency = row.original.urgency;
      return (
        <Badge tone={COMPLAINT_URGENCY_TONE[urgency] || "neutral"} className="capitalize">
          {COMPLAINT_URGENCY_LABEL[urgency] || urgency}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge tone={COMPLAINT_STATUS_TONE[status] || "neutral"} className="capitalize">
          {COMPLAINT_STATUS_LABEL[status] || status}
        </Badge>
      );
    },
  },
];
