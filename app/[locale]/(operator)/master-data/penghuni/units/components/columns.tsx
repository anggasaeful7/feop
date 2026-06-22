import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import type { Unit } from "@/types/master-data";

import { UNIT_STATUS_LABEL, UNIT_STATUS_TONE, BILL_PAYER_LABEL } from "@/lib/constants";

export const baseColumns: ColumnDef<Unit>[] = [
  {
    header: "Kode Unit",
    accessorKey: "code",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <>
          <div className="font-bold text-zinc-900">{u.code}</div>
          {u.block && (
            <div className="text-xs italic text-zinc-500">
              Blok {u.block}
              {u.floor != null ? ` · Lt ${u.floor}` : ""}
            </div>
          )}
        </>
      );
    },
  },
  {
    header: "Tipe",
    accessorKey: "unit_type_code",
    cell: ({ row }) => <span className="text-zinc-700">{row.original.unit_type_code}</span>,
  },
  {
    header: "Pemilik",
    accessorKey: "owner_name",
    cell: ({ row }) => (
      <span className="text-zinc-700">
        {row.original.owner_name ?? <span className="italic text-zinc-400">-</span>}
      </span>
    ),
  },
  {
    header: "Penghuni",
    accessorKey: "resident_name",
    cell: ({ row }) => {
      const u = row.original;
      const ownerIsResident = u.owner_id != null && u.owner_id === u.resident_id;
      return (
        <span className="text-zinc-700">
          {u.resident_name ?? <span className="italic text-zinc-400">-</span>}
          {ownerIsResident && (
            <span className="ml-2 text-xs italic text-zinc-500">
              (= pemilik)
            </span>
          )}
        </span>
      );
    },
  },
  {
    header: "Bayar Iuran",
    accessorKey: "bill_payer",
    cell: ({ row }) => {
      const u = row.original;
      return (
        u.bill_payer
          ?
          <Badge tone={u.bill_payer === "owner" ? "info" : "success"}>
            {BILL_PAYER_LABEL[u.bill_payer]}
          </Badge>
          : <span className="italic text-zinc-400">-</span>
      );
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <Badge tone={UNIT_STATUS_TONE[u.status]}>
          {UNIT_STATUS_LABEL[u.status]}
        </Badge>
      );
    },
  },
];
