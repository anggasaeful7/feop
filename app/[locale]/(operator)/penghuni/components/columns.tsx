"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ResidentBillByUnitItem } from "@/types/billing";
import { Badge } from "@/components/ui";
import { idr } from "@/lib/format";

export const baseColumns: ColumnDef<ResidentBillByUnitItem>[] = [
  {
    header: "Unit",
    id: "unit",
    cell: ({ row }) => {
      const unit = row.original;
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="whitespace-nowrap font-mono text-sm font-semibold text-zinc-900 bg-white px-2.5 py-1 rounded-md border border-[#E4DDCB]">
            {unit.unit_code}
          </span>
          {unit.unit_block && (
            <span className="whitespace-nowrap text-[10px] text-zinc-500 font-semibold bg-zinc-200/60 px-1.5 py-0.5 rounded uppercase">
              Blok {unit.unit_block}
            </span>
          )}
        </div>
      );
    },
  },
  {
    header: "Penghuni",
    accessorKey: "resident_name",
    cell: ({ row }) => <span className="font-medium text-zinc-800">{row.original.resident_name || "—"}</span>,
  },
  {
    header: "Pemilik",
    accessorKey: "owner_name",
    cell: ({ row }) => <span className="text-zinc-600 text-sm">{row.original.owner_name || "—"}</span>,
  },
  {
    header: "Total Tagihan",
    id: "total_amount",
    cell: ({ row }) => {
      const totalBills = row.original.bills.reduce((sum, b) => sum + b.total_amount, 0);
      const totalDebt = row.original.bills_debt ? row.original.bills_debt.reduce((sum, b) => sum + b.total_amount, 0) : 0;
      const totalAmount = totalBills + totalDebt;
      return <span className="font-bold text-zinc-950">{idr(totalAmount)}</span>;
    },
  },
  {
    header: "Status Pembayaran",
    id: "status_summary",
    cell: ({ row }) => {
      const unit = row.original;
      const unpaidDebtCount = unit.bills_debt ? unit.bills_debt.filter(b => b.status === "unpaid" || b.status === "rejected").length : 0;
      const unpaidCount = unit.bills.filter(b => b.status === "unpaid" || b.status === "rejected").length + unpaidDebtCount;
      const pendingCount = unit.bills.filter(b => b.status === "pending_verification").length;
      const paidCount = unit.bills.filter(b => b.status === "paid").length;

      return (
        <div className="flex flex-wrap gap-1">
          {unpaidCount > 0 && (
            <Badge tone="warning">
              {unpaidCount} Belum
            </Badge>
          )}
          {pendingCount > 0 && (
            <Badge tone="info">
              {pendingCount} Pending
            </Badge>
          )}
          {paidCount > 0 && (
            <Badge tone="success">
              {paidCount} Lunas
            </Badge>
          )}
          {unit.bills.length === 0 && unpaidDebtCount === 0 && (
            <span className="text-xs text-zinc-400 italic">Tidak ada tagihan</span>
          )}
        </div>
      );
    },
  },
];
