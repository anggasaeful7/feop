import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import type { Officer } from "@/types/master-data";

export const baseColumns: ColumnDef<Officer>[] = [
  {
    header: "Nama Petugas",
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
    header: "Kontak",
    accessorKey: "contact",
    cell: ({ row }) => <span className="text-zinc-700">{row.original.contact}</span>,
  },
  {
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <span className="text-zinc-700">
        {row.original.email || <span className="italic text-zinc-400">-</span>}
      </span>
    ),
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
