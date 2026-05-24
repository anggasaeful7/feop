"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { Complaint } from "@/types/complaint";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";

interface ColumnsProps {
  onDetail: (complaint: Complaint) => void;
}

export const getColumns = ({ onDetail }: ColumnsProps): ColumnDef<Complaint>[] => [
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
      const colors: Record<string, string> = {
        low: "bg-zinc-100 text-zinc-700 border-zinc-200",
        medium: "bg-amber-50 text-amber-700 border-amber-200",
        high: "bg-red-50 text-red-700 border-red-200",
      };
      return (
        <Badge variant="outline" className={`capitalize ${colors[urgency] || colors.low}`}>
          {urgency}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const colors: Record<string, string> = {
        open: "bg-blue-50 text-blue-700 border-blue-200",
        in_progress: "bg-amber-50 text-amber-700 border-amber-200",
        resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
        closed: "bg-zinc-100 text-zinc-700 border-zinc-200",
      };
      return (
        <Badge variant="outline" className={`capitalize ${colors[status] || colors.open}`}>
          {status.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDetail(row.original)}
        title="Lihat Detail"
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
];
