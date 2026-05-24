"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/format";
import type { RenovationPermit } from "@/types/renovation-permit";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ColumnsProps {
  onDetail: (permit: RenovationPermit) => void;
}

export const getColumns = ({ onDetail }: ColumnsProps): ColumnDef<RenovationPermit>[] => [
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
    accessorKey: "renovation_level",
    header: "Tingkat Renovasi",
    cell: ({ row }) => {
      const level = row.original.renovation_level;
      const getLevelColor = (l: string) => {
        if (l.includes("berat")) return "bg-red-50 text-red-700 border-red-200";
        if (l.includes("sedang")) return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-blue-50 text-blue-700 border-blue-200";
      };

      return (
        <Badge variant="outline" className={`capitalize ${getLevelColor(level)}`}>
          {level.replace(/_/g, " ")}
        </Badge>
      );
    }
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const getStatusColor = (s: string) => {
        switch (s) {
          case "pending":
            return "bg-amber-100 text-amber-800 border-amber-300";
          case "approved":
            return "bg-emerald-100 text-emerald-800 border-emerald-300";
          case "rejected":
            return "bg-red-100 text-red-800 border-red-300";
          default:
            return "bg-zinc-100 text-zinc-800 border-zinc-300";
        }
      };

      return (
        <Badge variant="outline" className={`capitalize ${getStatusColor(status)}`}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDetail(row.original)}
          className="h-8 px-2 text-zinc-500 hover:text-zinc-900"
        >
          <Eye className="mr-2 h-4 w-4" />
          Detail
        </Button>
      </div>
    ),
  },
];
