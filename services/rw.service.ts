import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { RW, RWPayload, RWBulkPayload, RWQueryParams } from "@/types/master-data";

export const RwService = {
  getRws: async (params?: RWQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    const path = `/master/rws${query ? `?${query}` : ""}`;
    return api<Paged<RW>>(path);
  },

  getRw: async (id: string) => {
    return api<RW>(`/master/rws/${id}`);
  },

  createRw: async (payload: RWPayload) => {
    return api<RW>("/master/rws", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  bulkCreateRws: async (payload: RWBulkPayload) => {
    return api<RW[]>("/master/rws/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateRw: async (id: string, payload: RWPayload) => {
    return api<RW>(`/master/rws/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteRw: async (id: string) => {
    return api(`/master/rws/${id}`, {
      method: "DELETE",
    });
  },
};
