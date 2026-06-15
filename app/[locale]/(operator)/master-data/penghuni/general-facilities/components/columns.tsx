"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/format";
import { GeneralFacility } from "@/types";
import { Badge } from "@/components/ui/badge";

export const baseColumns: ColumnDef<GeneralFacility>[] = [
  {
    accessorKey: "name",
    header: "Nama Fasilitas",
    cell: ({ row }) => <div className="font-medium text-zinc-900">{row.original.name}</div>,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const active = row.original.is_active;
      return (
        <Badge tone={active ? "success" : "neutral"}>
          {active ? "Aktif" : "Non-Aktif"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_auto_suspend",
    header: "Auto Suspend",
    cell: ({ row }) => {
      const autoSuspend = row.original.is_auto_suspend;
      return (
        <Badge tone={autoSuspend ? "success" : "neutral"}>
          {autoSuspend ? "Aktif" : "Non-Aktif"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "updated_at",
    header: "Update Terakhir",
    cell: ({ row }) => {
      const date = row.original.updated_at;
      return <div className="text-zinc-500">{date ? formatDateTime(date) : "-"}</div>;
    },
  },
];
