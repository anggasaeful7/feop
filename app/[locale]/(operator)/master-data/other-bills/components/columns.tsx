import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import { idr } from "@/lib/format";
import type { SpecificBilling } from "@/types/specific-billing";

export const baseColumns: ColumnDef<SpecificBilling>[] = [
  {
    header: "Judul",
    accessorKey: "title",
    cell: ({ row }) => (
      <>
        <div className="font-bold text-zinc-900">{row.original.title}</div>
        {row.original.description && (
          <div className="text-xs text-zinc-500">{row.original.description}</div>
        )}
      </>
    ),
  },
  {
    header: "Harga",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-medium text-zinc-900">{idr(row.original.amount)}</span>
    ),
  },
  {
    header: "Status",
    accessorKey: "is_active",
    cell: ({ row }) => (
      <Badge tone={row.original.is_active ? "success" : "neutral"}>
        {row.original.is_active ? "Aktif" : "Nonaktif"}
      </Badge>
    ),
  },
];
