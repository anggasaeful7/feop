"use client";

import { useState } from "react";
import { CalendarPlus, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui";
import { idr } from "@/lib/format";
import { useFacilities } from "@/hooks/api/use-facility";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
import type { Booking, BookingPayload, Facility, FacilityPayload } from "@/types/facility";
import { FacilityCards } from "./facility-cards";
import { BookingList } from "./booking-list";
import { FacilityFormModal } from "./modals/facility-form-modal";
import { BookingFormModal } from "./modals/booking-form-modal";

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

export function FasilitasManager() {
  const [creatingFacility, setCreatingFacility] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const { data, isLoading } = useFacilities();
  const facilities = data?.items ?? [];
  const totalRevenue = facilities.reduce((sum, f) => sum + f.revenue_mtd, 0);

  const { data: permissions } = usePermissions();
  const canCreateFacility = hasPermission(permissions, "facilities", "create");
  const canUpdateFacility = hasPermission(permissions, "facilities", "update");
  const canCreateBooking = hasPermission(permissions, "facility_bookings", "create");

  return (
    <>
      <PageHeader
        eyebrow={
          isLoading
            ? "Memuat…"
            : `Admin · ${facilities.length} fasilitas · Pendapatan MTD ${idr(totalRevenue)}`
        }
        title="Fasilitas — Approvals & Booking"
        subtitle="Review request booking dari penghuni & atur jadwal"
        actions={
          <div className="flex w-full flex-col sm:flex-row gap-2">
            {canCreateBooking && (
              <Button
                variant="secondary"
                onClick={() => setCreatingBooking(true)}
                className="w-full sm:w-auto"
              >
                <CalendarPlus size={16} /> Tambah Booking
              </Button>
            )}
            {canCreateFacility && (
              <Button
                onClick={() => setCreatingFacility(true)}
                className="w-full sm:w-auto"
              >
                <Plus size={16} /> Tambah Fasilitas
              </Button>
            )}
          </div>
        }
      />

      <FacilityCards
        onEdit={canUpdateFacility ? setEditingFacility : undefined}
      />

      <BookingList onEditBooking={setEditingBooking} />

      {creatingFacility && (
        <FacilityFormModal
          title="Tambah Fasilitas"
          initial={emptyFacility}
          onClose={() => setCreatingFacility(false)}
        />
      )}

      {editingFacility && (
        <FacilityFormModal
          title={`Edit ${editingFacility.name}`}
          id={editingFacility.id}
          initial={{
            code: editingFacility.code,
            name: editingFacility.name,
            description: editingFacility.description,
            pricing_mode: editingFacility.pricing_mode,
            price: editingFacility.price,
            is_active: editingFacility.is_active,
          }}
          onClose={() => setEditingFacility(null)}
        />
      )}

      {creatingBooking && (
        <BookingFormModal
          title="Tambah Booking"
          initial={emptyBooking}
          facilities={facilities}
          onClose={() => setCreatingBooking(false)}
        />
      )}

      {editingBooking && (
        <BookingFormModal
          title="Edit Booking"
          id={editingBooking.id}
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
          facilities={facilities}
          onClose={() => setEditingBooking(null)}
        />
      )}
    </>
  );
}
