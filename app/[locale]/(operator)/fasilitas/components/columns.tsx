"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui";
import { Receipt } from "lucide-react";
import type { Booking, BookingStatus } from "@/types/facility";
import { formatBookingWindow, idr } from "@/lib/format";

export function bookingColumns(opts?: { onEditProof?: (b: Booking) => void }) {
  return [
    {
      header: "Unit / Pemohon",
      cell: ({ row }: { row: { original: Booking } }) => {
        const { unit_code, requester_name } = row.original;
        return (
          <div className="text-zinc-800">
            {unit_code ? (
              <>
                <span className="font-semibold">{unit_code}</span>
                <span className="mx-1 text-zinc-400">·</span>
                {requester_name}
              </>
            ) : (
              requester_name
            )}
          </div>
        );
      },
    },
    {
      header: "Fasilitas",
      accessorKey: "facility_name",
      cell: ({ row }: { row: { original: Booking } }) => (
        <span className="italic text-zinc-600">{row.original.facility_name}</span>
      ),
    },
    {
      header: "Jadwal",
      cell: ({ row }: { row: { original: Booking } }) => (
        <span className="text-zinc-700">
          {formatBookingWindow(row.original.starts_at, row.original.ends_at)}
        </span>
      ),
    },
    {
      header: "Keperluan",
      accessorKey: "purpose",
      cell: ({ row }: { row: { original: Booking } }) => (
        <span className="italic text-zinc-600">{row.original.purpose ?? "—"}</span>
      ),
    },
    {
      header: "Biaya",
      accessorKey: "price",
      cell: ({ row }: { row: { original: Booking } }) => (
        <span className="font-semibold text-zinc-900">{idr(row.original.price)}</span>
      ),
    },
    {
      header: "Bukti",
      accessorKey: "proof_url",
      cell: ({ row }: { row: { original: Booking } }) => {
        const r = row.original;
        const content = r.proof_url ? (
          <Badge tone="success">
            <Receipt size={12} /> Ada
          </Badge>
        ) : (
          <Badge tone="warning">Belum</Badge>
        );
        if (!opts?.onEditProof) return content;
        return (
          <button
            onClick={() => opts.onEditProof!(r)}
            className="inline-flex items-center gap-1"
            title="Klik untuk ubah URL bukti"
          >
            {content}
          </button>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }: { row: { original: Booking } }) => (
        <StatusBadge status={row.original.status} />
      ),
    },
  ] as ColumnDef<Booking>[];
}

function StatusBadge({ status }: { status: BookingStatus }) {
  switch (status) {
    case "pending":
      return <Badge tone="warning">Pending</Badge>;
    case "approved":
      return <Badge tone="success">Approved</Badge>;
    case "rejected":
      return <Badge tone="danger">Rejected</Badge>;
    case "cancelled":
      return <Badge tone="neutral">Cancelled</Badge>;
  }
}
