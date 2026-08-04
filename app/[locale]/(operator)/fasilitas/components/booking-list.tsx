"use client";

import { useMemo, useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button, DataTable } from "@/components/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useApproveBooking,
  useBookings,
  useFacilities,
  useRejectBooking,
  useSetBookingProof,
} from "@/hooks/api/use-facility";
import { useDataTableState } from "@/hooks/use-data-table-state";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
import { bookingColumns } from "./columns";
import type { Booking } from "@/types/facility";

export function BookingList({ onEditBooking }: { onEditBooking: (b: Booking) => void }) {
  const { search, setSearch, debouncedSearch, page, setPage, perPage } =
    useDataTableState();
  const [status, setStatus] = useState("pending");

  const { data, isLoading } = useBookings({
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
    status: status !== "all" ? status : undefined,
  });

  const { data: facData } = useFacilities();
  const totalPending = (facData?.items ?? []).reduce(
    (sum, f) => sum + f.pending_count,
    0,
  );

  const { data: permissions } = usePermissions();
  const canUpdate =
    hasPermission(permissions, "facility_bookings", "update");
  const canApprove =
    hasPermission(permissions, "facility_bookings", "approve") || canUpdate;
  const canReject =
    hasPermission(permissions, "facility_bookings", "reject") || canUpdate;

  const approve = useApproveBooking();
  const reject = useRejectBooking();
  const setProof = useSetBookingProof();

  const columns: ColumnDef<Booking>[] = useMemo(() => {
    const handleReject = (b: Booking) => {
      const note = window.prompt("Alasan penolakan (opsional):");
      if (note === null) return;
      reject.mutate({ id: b.id, note: note.trim() === "" ? undefined : note.trim() });
    };

    const handleProof = (b: Booking) => {
      const next = window.prompt(
        "URL bukti bayar (kosongkan untuk hapus):",
        b.proof_url ?? "",
      );
      if (next === null) return;
      setProof.mutate({ id: b.id, proofUrl: next.trim() === "" ? null : next.trim() });
    };

    const base = canUpdate ? bookingColumns({ onEditProof: handleProof }) : bookingColumns();
    return [
      ...base,
      {
        id: "actions",
        cell: ({ row }) => {
          const r = row.original;
          if (r.status !== "pending") return null;
          return (
            <div className="flex justify-end gap-2">
              {canReject && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleReject(r)}
                >
                  <X size={12} /> Tolak
                </Button>
              )}
              {canApprove && (
                <Button size="sm" onClick={() => approve.mutate(r.id)}>
                  <Check size={12} /> Approve
                </Button>
              )}
              {canUpdate && (
                <button
                  onClick={() => onEditBooking(r)}
                  className="text-zinc-400 hover:text-zinc-700"
                  aria-label="Edit"
                >
                  <Pencil size={14} />
                </button>
              )}
            </div>
          );
        },
      },
    ];
  }, [canUpdate, canApprove, canReject, approve, reject, setProof, onEditBooking]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
        <div>
          <div className="text-base font-bold text-amber-900">
            {totalPending > 0
              ? `${totalPending} Request Pending Approval`
              : "Tidak ada pending"}
          </div>
          <div className="text-xs italic text-amber-900/70">
            Review segera · rata-rata response 2 jam
          </div>
        </div>
      </div>

      <DataTable
        title="Daftar Booking"
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        total={data?.total ?? 0}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari unit / pemohon / fasilitas…"
        actions={
          <div className="w-full sm:w-40">
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full h-9 rounded-lg border-zinc-200 text-xs font-medium bg-zinc-50 text-zinc-800">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="all">Semua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />
    </div>
  );
}
