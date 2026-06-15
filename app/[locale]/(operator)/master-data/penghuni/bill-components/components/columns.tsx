import { ColumnDef } from "@tanstack/react-table";
import type { BillComponent } from "@/types/master-data";

export const baseColumns: ColumnDef<BillComponent>[] = [
  {
    header: "Nama",
    accessorKey: "name",
    cell: ({ row }) => <span className="font-bold text-zinc-900 italic">{row.original.name}</span>,
  },
  {
    header: "Desc",
    accessorKey: "description",
    cell: ({ row }) => <span className="text-zinc-700 italic">{row.original.description || "-"}</span>,
  },
  {
    header: "Harga",
    accessorKey: "amount",
    cell: ({ row }) => (
      <div className="font-bold">
        {row.original.amount !== null && row.original.amount !== undefined ? (
          <span><span className="text-[10px] text-zinc-500 font-normal mr-1">Rp</span>{row.original.amount.toLocaleString("id-ID")}</span>
        ) : (
          <span className="text-zinc-400">-</span>
        )}
      </div>
    ),
  },
];
