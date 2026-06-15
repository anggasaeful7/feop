import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import type { Shift } from "@/types/master-data";

export const baseColumns: ColumnDef<Shift>[] = [
  {
    header: "Nama Shift",
    accessorKey: "name",
    cell: ({ row }) => <span className="font-bold text-zinc-900">{row.original.name}</span>,
  },
  {
    header: "Divisi",
    accessorKey: "division",
    cell: ({ row }) => (
      <Badge tone={row.original.division === "cleaning" ? "info" : "warning"}>
        {row.original.division === "cleaning" ? "Kebersihan" : "Keamanan"}
      </Badge>
    ),
  },
  {
    header: "Jam Mulai",
    accessorKey: "time_start",
    cell: ({ row }) => <span className="text-zinc-700 font-medium">{row.original.time_start}</span>,
  },
  {
    header: "Jam Selesai",
    accessorKey: "time_end",
    cell: ({ row }) => <span className="text-zinc-700 font-medium">{row.original.time_end}</span>,
  },
  {
    header: "Status",
    accessorKey: "is_active",
    cell: ({ row }) => (
      <Badge tone={row.original.is_active ? "success" : "neutral"}>
        {row.original.is_active ? "Aktif" : "Tidak Aktif"}
      </Badge>
    ),
  },
];
