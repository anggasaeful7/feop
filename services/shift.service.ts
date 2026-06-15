import { api } from "@/lib/axios";
import type { Shift, ShiftPayload, ShiftQueryParams } from "@/types/master-data";
import type { Paged } from "@/types";

export const ShiftService = {
  getShifts: async (params?: ShiftQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.per_page) searchParams.append("per_page", params.per_page.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.division) searchParams.append("division", params.division);

    return api<Paged<Shift>>(`/master/shifts?${searchParams.toString()}`);
  },

  createShift: async (payload: ShiftPayload) => {
    return api<Shift>("/master/shifts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateShift: async (id: string, payload: ShiftPayload) => {
    return api<Shift>(`/master/shifts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteShift: async (id: string) => {
    return api<void>(`/master/shifts/${id}`, {
      method: "DELETE",
    });
  },
};
