import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import type { RW } from "@/types/master-data";

export const baseColumns: ColumnDef<RW>[] = [
  {
    header: "Kode RW",
    accessorKey: "code",
    cell: ({ row }) => <span className="font-bold text-zinc-900">{row.original.code}</span>,
  },
  {
    header: "Nama RW",
    accessorKey: "name",
    cell: ({ row }) => <span className="text-zinc-700">{row.original.name}</span>,
  },
  {
    header: "Status",
    accessorKey: "is_active",
    cell: ({ row }) => (
      <Badge tone={row.original.is_active ? "success" : "neutral"}>
        {row.original.is_active ? "Aktif" : "Non-Aktif"}
      </Badge>
    ),
  },
  {
    header: "Tanggal Dibuat",
    accessorKey: "created_at",
    cell: ({ row }) => (
      <span className="text-zinc-700">
        {row.original.created_at
          ? new Date(row.original.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "-"}
      </span>
    ),
  },
];
