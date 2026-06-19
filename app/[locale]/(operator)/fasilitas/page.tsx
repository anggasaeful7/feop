"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarPlus,
  Check,
  Pencil,
  Plus,
  Receipt,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Button, Card } from "@/components/ui";
import { api, ApiError } from "@/lib/axios";
import { idr, idrShort, formatBookingWindow } from "@/lib/format";
import type { Paged } from "@/types";
import type { Booking, BookingPayload, BookingStatus, Facility, FacilityPayload } from "@/types/facility";
import { FacilityFormModal } from "./components/facility-modal";
import { BookingFormModal } from "./components/booking-modal";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

const STATUS_FILTERS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "Semua" },
];

const emptyFacility: FacilityPayload = {
  code: "",
  name: "",
  description: null,
  pricing_mode: "per_session",
  price: 0,
  is_active: true,
};

const emptyBooking: BookingPayload = {
  facility_id: "",
  unit_id: null,
  requester_name: "",
  starts_at: "",
  ends_at: "",
  purpose: null,
  price: null,
  proof_url: null,
};

export default function FasilitasPage() {
  const [facilities, setFacilities] = useState<Facility[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("pending");
  const [creatingFacility, setCreatingFacility] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const { data: permissions } = usePermissions();

  const canCreateFacility = hasPermission(permissions, "facilities", "create");
  const canUpdateFacility = hasPermission(permissions, "facilities", "update");

  const canCreateBooking = hasPermission(permissions, "facility_bookings", "create");
  const canUpdateBooking = hasPermission(permissions, "facility_bookings", "update");
  const canApproveBooking = hasPermission(permissions, "facility_bookings", "approve") || canUpdateBooking;
  const canRejectBooking = hasPermission(permissions, "facility_bookings", "reject") || canUpdateBooking;

  const loadFacilities = useCallback(async () => {
    try {
      const out = await api<Paged<Facility>>("/facilities?per_page=100");
      setFacilities(out.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat fasilitas");
    }
  }, []);

  const loadBookings = useCallback(async () => {
    try {
      const qs = new URLSearchParams({ per_page: "100" });
      if (statusFilter !== "all") qs.set("status", statusFilter);
      const out = await api<Paged<Booking>>(
        `/facilities/bookings?${qs.toString()}`,
      );
      setBookings(out.items);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat booking");
    }
  }, [statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFacilities();
  }, [loadFacilities]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadBookings();
  }, [loadBookings]);

  const totalPending = useMemo(
    () => (facilities ?? []).reduce((sum, f) => sum + f.pending_count, 0),
    [facilities],
  );
  const totalRevenue = useMemo(
    () => (facilities ?? []).reduce((sum, f) => sum + f.revenue_mtd, 0),
    [facilities],
  );

  async function approveBooking(id: string) {
    try {
      await api(`/facilities/bookings/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await Promise.all([loadBookings(), loadFacilities()]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal approve");
    }
  }

  async function rejectBooking(id: string) {
    const note = window.prompt("Alasan penolakan (opsional):") ?? undefined;
    try {
      await api(`/facilities/bookings/${id}/reject`, {
        method: "POST",
        body: JSON.stringify(note ? { note } : {}),
      });
      await Promise.all([loadBookings(), loadFacilities()]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal tolak");
    }
  }

  async function setProof(b: Booking) {
    const next = window.prompt(
      "URL bukti bayar (kosongkan untuk hapus):",
      b.proof_url ?? "",
    );
    if (next === null) return;
    try {
      await api(`/facilities/bookings/${b.id}/proof`, {
        method: "PATCH",
        body: JSON.stringify({ proof_url: next.trim() === "" ? null : next.trim() }),
      });
      await loadBookings();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal simpan bukti");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={
          facilities === null
            ? "Memuat…"
            : `Admin · ${facilities.length} fasilitas · Pendapatan MTD ${idr(totalRevenue)}`
        }
        title="Fasilitas — Approvals & Booking"
        subtitle="Review request booking dari penghuni & atur jadwal"
        actions={
          <div className="flex w-full flex-col sm:flex-row gap-2">
            {canCreateBooking && (
              <Button variant="secondary" onClick={() => setCreatingBooking(true)} className="w-full sm:w-auto">
                <CalendarPlus size={16} /> Tambah Booking
              </Button>
            )}
            {canCreateFacility && (
              <Button onClick={() => setCreatingFacility(true)} className="w-full sm:w-auto">
                <Plus size={16} /> Tambah Fasilitas
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {facilities === null && (
          <div className="col-span-1 md:col-span-2 lg:col-span-4 rounded-2xl border border-zinc-200/70 bg-white p-6 text-center text-sm text-zinc-500">
            Memuat fasilitas…
          </div>
        )}
        {facilities !== null && facilities.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500">
            Belum ada fasilitas. Klik “Tambah Fasilitas”.
          </div>
        )}
        {facilities?.map((f) => (
          <button
            key={f.id}
            onClick={canUpdateFacility ? () => setEditingFacility(f) : undefined}
            className={`rounded-2xl border border-zinc-200/70 bg-white p-4 text-left transition ${
              canUpdateFacility ? "hover:border-zinc-300 hover:shadow-sm" : "cursor-default"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-cream-100 text-zinc-700">
                <Building2 size={20} />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-900">{f.name}</span>
                  {!f.is_active && (
                    <Badge tone="neutral">nonaktif</Badge>
                  )}
                </div>
                <div className="text-xs italic text-zinc-500">
                  {f.bookings_mtd}× bulan ini ·{" "}
                  {f.pricing_mode === "monthly" ? "membership" : "per sesi"}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-bold text-zinc-900">
                {idrShort(f.revenue_mtd)}
              </div>
              {f.pending_count > 0 && (
                <Badge tone="warning">{f.pending_count} pending</Badge>
              )}
            </div>
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-3 bg-accent-warm-soft px-6 py-4">
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
          <div className="flex items-center gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`h-8 rounded-full px-3 text-xs font-semibold transition ${statusFilter === f.key
                  ? "bg-amber-900 text-white"
                  : "border border-amber-900/30 bg-white text-amber-900 hover:bg-amber-50"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 text-left">Unit / Pemohon</th>
              <th className="px-4 py-3 text-left">Fasilitas</th>
              <th className="px-4 py-3 text-left">Jadwal</th>
              <th className="px-4 py-3 text-left">Keperluan</th>
              <th className="px-4 py-3 text-left">Biaya</th>
              <th className="px-4 py-3 text-left">Bukti</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {bookings === null && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-zinc-400">
                  Memuat…
                </td>
              </tr>
            )}
            {bookings !== null && bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-zinc-400">
                  Belum ada booking pada filter ini.
                </td>
              </tr>
            )}
            {bookings?.map((r) => (
              <tr key={r.id} className="border-t border-zinc-200/70">
                <td className="px-4 py-4 text-zinc-800">
                  {r.unit_code ? (
                    <>
                      <span className="font-semibold">{r.unit_code}</span>
                      <span className="mx-1 text-zinc-400">·</span>
                      {r.requester_name}
                    </>
                  ) : (
                    r.requester_name
                  )}
                </td>
                <td className="px-4 py-4 italic text-zinc-600">{r.facility_name}</td>
                <td className="px-4 py-4 text-zinc-700">
                  {formatBookingWindow(r.starts_at, r.ends_at)}
                </td>
                <td className="px-4 py-4 italic text-zinc-600">
                  {r.purpose ?? "—"}
                </td>
                <td className="px-4 py-4 font-semibold text-zinc-900">
                  {idr(r.price)}
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={canUpdateBooking ? () => setProof(r) : undefined}
                    className="inline-flex items-center gap-1"
                    title={canUpdateBooking ? "Klik untuk ubah URL bukti" : undefined}
                    disabled={!canUpdateBooking}
                  >
                    {r.proof_url ? (
                      <Badge tone="success">
                        <Receipt size={12} /> Ada
                      </Badge>
                    ) : (
                      <Badge tone="warning">Belum</Badge>
                    )}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    {r.status === "pending" && (
                      <>
                        {canRejectBooking && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => rejectBooking(r.id)}
                          >
                            <X size={12} /> Tolak
                          </Button>
                        )}
                        {canApproveBooking && (
                          <Button size="sm" onClick={() => approveBooking(r.id)}>
                            <Check size={12} /> Approve
                          </Button>
                        )}
                        {canUpdateBooking && (
                          <button
                            onClick={() => setEditingBooking(r)}
                            className="text-zinc-400 hover:text-zinc-700"
                            aria-label="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {creatingFacility && (
        <FacilityFormModal
          title="Tambah Fasilitas"
          initial={emptyFacility}
          onClose={() => setCreatingFacility(false)}
          onSubmit={async (payload) => {
            await api<Facility>("/facilities", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            setCreatingFacility(false);
            await loadFacilities();
          }}
        />
      )}

      {editingFacility && (
        <FacilityFormModal
          title={`Edit ${editingFacility.name}`}
          initial={{
            code: editingFacility.code,
            name: editingFacility.name,
            description: editingFacility.description,
            pricing_mode: editingFacility.pricing_mode,
            price: editingFacility.price,
            is_active: editingFacility.is_active,
          }}
          onClose={() => setEditingFacility(null)}
          onDelete={async () => {
            if (!confirm(`Hapus fasilitas ${editingFacility.name}?`)) return;
            await api(`/facilities/${editingFacility.id}`, {
              method: "DELETE",
            });
            setEditingFacility(null);
            await loadFacilities();
          }}
          onSubmit={async (payload) => {
            await api<Facility>(`/facilities/${editingFacility.id}`, {
              method: "PUT",
              body: JSON.stringify(payload),
            });
            setEditingFacility(null);
            await loadFacilities();
          }}
        />
      )}

      {creatingBooking && (
        <BookingFormModal
          title="Tambah Booking"
          initial={emptyBooking}
          facilities={facilities ?? []}
          onClose={() => setCreatingBooking(false)}
          onSubmit={async (payload) => {
            await api<Booking>("/facilities/bookings", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            setCreatingBooking(false);
            await Promise.all([loadBookings(), loadFacilities()]);
          }}
        />
      )}

      {editingBooking && (
        <BookingFormModal
          title="Edit Booking"
          initial={{
            facility_id: editingBooking.facility_id,
            unit_id: editingBooking.unit_id,
            requester_name: editingBooking.requester_name,
            starts_at: editingBooking.starts_at,
            ends_at: editingBooking.ends_at,
            purpose: editingBooking.purpose,
            price: editingBooking.price,
            proof_url: editingBooking.proof_url,
          }}
          facilities={facilities ?? []}
          onClose={() => setEditingBooking(null)}
          onSubmit={async (payload) => {
            await api<Booking>(
              `/facilities/bookings/${editingBooking.id}`,
              {
                method: "PUT",
                body: JSON.stringify(payload),
              },
            );
            setEditingBooking(null);
            await Promise.all([loadBookings(), loadFacilities()]);
          }}
        />
      )}
    </>
  );
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
