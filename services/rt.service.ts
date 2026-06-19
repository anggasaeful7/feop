import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { RT, RTPayload, RTQueryParams } from "@/types/master-data";

export const RtService = {
  getRts: async (params?: RTQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    const path = `/master/rts${query ? `?${query}` : ""}`;
    return api<Paged<RT>>(path);
  },

  getRt: async (id: string) => {
    return api<RT>(`/master/rts/${id}`);
  },

  createRt: async (payload: RTPayload) => {
    return api<RT>("/master/rts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateRt: async (id: string, payload: RTPayload) => {
    return api<RT>(`/master/rts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteRt: async (id: string) => {
    return api(`/master/rts/${id}`, {
      method: "DELETE",
    });
  },
};
