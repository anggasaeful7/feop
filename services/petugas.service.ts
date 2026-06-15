import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { Officer, OfficerPayload, OfficerQueryParams } from "@/types/master-data";

export const OfficerService = {
  getOfficers: async (params?: OfficerQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    const path = `/master/officers${query ? `?${query}` : ""}`;
    return api<Paged<Officer>>(path);
  },

  getOfficer: async (id: string) => {
    return api<Officer>(`/master/officers/${id}`);
  },

  createOfficer: async (payload: OfficerPayload) => {
    return api<Officer>("/master/officers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateOfficer: async (id: string, payload: OfficerPayload) => {
    return api<Officer>(`/master/officers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteOfficer: async (id: string) => {
    return api(`/master/officers/${id}`, {
      method: "DELETE",
    });
  },
};
