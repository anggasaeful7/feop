import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import type { EmergencyContact } from "@/types/emergency-contact";

export const baseColumns: ColumnDef<EmergencyContact>[] = [
  {
    header: "Nama Kontak",
    accessorKey: "name",
    cell: ({ row }) => (
      <div>
        <div className="font-bold text-zinc-900">{row.original.name}</div>
        <div className="text-xs text-zinc-500 italic">{row.original.phone}</div>
      </div>
    ),
  },
  {
    header: "Peran",
    accessorKey: "role",
    cell: ({ row }) => <span className="font-medium text-zinc-700">{row.original.role}</span>,
  },
  {
    header: "Jam Operasional",
    accessorKey: "hours",
    cell: ({ row }) => <span className="text-zinc-600 italic">{row.original.hours}</span>,
  },
  {
    header: "Status",
    accessorKey: "is_active",
    cell: ({ row }) => {
      const isActive = row.original.is_active;
      return isActive ? (
        <Badge tone="success">Aktif</Badge>
      ) : (
        <Badge tone="neutral">Tidak Aktif</Badge>
      );
    },
  },
];
