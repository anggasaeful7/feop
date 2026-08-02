import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";
import { FacilityService, GetBookingsParams } from "@/services/facility.service";
import type { BookingPayload, FacilityPayload } from "@/types/facility";

export const facilityQK = {
  all: ["facilities"] as const,
  list: () => [...facilityQK.all, "list"] as const,
  bookings: (params?: GetBookingsParams) =>
    [...facilityQK.all, "bookings", params] as const,
};

function errMsg(e: unknown, fallback: string) {
  return e instanceof ApiError ? e.message : fallback;
}

export function useFacilities() {
  return useQuery({
    queryKey: facilityQK.list(),
    queryFn: () => FacilityService.getFacilities(),
  });
}

export function useBookings(params?: GetBookingsParams) {
  return useQuery({
    queryKey: facilityQK.bookings(params),
    queryFn: () => FacilityService.getBookings(params),
  });
}

export function useSaveFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: FacilityPayload }) =>
      id
        ? FacilityService.updateFacility(id, payload)
        : FacilityService.createFacility(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facilityQK.list() });
      toast.success("Fasilitas berhasil disimpan");
    },
    onError: (e) => toast.error(errMsg(e, "Gagal menyimpan fasilitas")),
  });
}

export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => FacilityService.deleteFacility(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facilityQK.list() });
      toast.success("Fasilitas berhasil dihapus");
    },
    onError: (e) => toast.error(errMsg(e, "Gagal menghapus fasilitas")),
  });
}

export function useSaveBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: BookingPayload }) =>
      id
        ? FacilityService.updateBooking(id, payload)
        : FacilityService.createBooking(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facilityQK.all });
      toast.success("Booking berhasil disimpan");
    },
    onError: (e) => toast.error(errMsg(e, "Gagal menyimpan booking")),
  });
}

export function useApproveBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => FacilityService.approveBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facilityQK.all });
      toast.success("Booking disetujui");
    },
    onError: (e) => toast.error(errMsg(e, "Gagal menyetujui booking")),
  });
}

export function useRejectBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      FacilityService.rejectBooking(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facilityQK.all });
      toast.success("Booking ditolak");
    },
    onError: (e) => toast.error(errMsg(e, "Gagal menolak booking")),
  });
}

export function useSetBookingProof() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, proofUrl }: { id: string; proofUrl: string | null }) =>
      FacilityService.setBookingProof(id, proofUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: facilityQK.bookings() });
      toast.success("Bukti bayar disimpan");
    },
    onError: (e) => toast.error(errMsg(e, "Gagal menyimpan bukti bayar")),
  });
}
