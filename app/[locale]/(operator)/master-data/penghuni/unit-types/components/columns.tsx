import { ColumnDef } from "@tanstack/react-table";
import type { UnitType } from "@/types/master-data";
import { formatEffective } from "@/lib/format";

export const baseColumns: ColumnDef<UnitType>[] = [
  {
    header: "Tipe",
    accessorKey: "code",
    cell: ({ row }) => <span className="font-bold text-zinc-900">{row.original.code}</span>,
  },
  {
    header: "Luas",
    accessorKey: "area_sqm",
    cell: ({ row }) => <span className="text-zinc-700">{row.original.area_sqm} m²</span>,
  },
  {
    header: "Unit",
    accessorKey: "unit_count",
    cell: ({ row }) => <span className="text-zinc-700">{row.original.unit_count} unit</span>,
  },
  {
    header: "Efektif",
    accessorKey: "effective_from",
    cell: ({ row }) => (
      <span className="italic text-zinc-500">
        {formatEffective(row.original.effective_from)}
      </span>
    ),
  },
];
