import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type {
  Booking,
  BookingPayload,
  Facility,
  FacilityPayload,
} from "@/types/facility";

export type GetBookingsParams = {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
};

export const FacilityService = {
  getFacilities: async () => {
    return api<Paged<Facility>>("/facilities?per_page=100");
  },

  createFacility: async (payload: FacilityPayload) => {
    return api<Facility>("/facilities", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateFacility: async (id: string, payload: FacilityPayload) => {
    return api<Facility>(`/facilities/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteFacility: async (id: string) => {
    return api(`/facilities/${id}`, {
      method: "DELETE",
    });
  },

  getBookings: async (params?: GetBookingsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page !== undefined) searchParams.append("page", params.page.toString());
    if (params?.per_page !== undefined) searchParams.append("per_page", params.per_page.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.search) searchParams.append("search", params.search);
    return api<Paged<Booking>>(`/facilities/bookings?${searchParams.toString()}`);
  },

  createBooking: async (payload: BookingPayload) => {
    return api<Booking>("/facilities/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBooking: async (id: string, payload: BookingPayload) => {
    return api<Booking>(`/facilities/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  approveBooking: async (id: string) => {
    return api(`/facilities/bookings/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  rejectBooking: async (id: string, note?: string) => {
    return api(`/facilities/bookings/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(note ? { note } : {}),
    });
  },

  setBookingProof: async (id: string, proofUrl: string | null) => {
    return api(`/facilities/bookings/${id}/proof`, {
      method: "PATCH",
      body: JSON.stringify({ proof_url: proofUrl }),
    });
  },
};
