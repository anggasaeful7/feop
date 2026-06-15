import { api } from "@/lib/axios";
import {
  Paged,
  Punishment,
  PunishmentPayload,
} from "@/types";

export const PunishmentService = {
  getPunishments: async (params?: { page?: number; per_page?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const path = `/master/punishments${query ? `?${query}` : ""}`;
    return api<Paged<Punishment>>(path);
  },

  getPunishment: async (id: string) => {
    return api<Punishment>(`/master/punishments/${id}`);
  },

  createPunishment: async (payload: PunishmentPayload) => {
    return api<Punishment>("/master/punishments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updatePunishment: async (id: string, payload: PunishmentPayload) => {
    return api<Punishment>(`/master/punishments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deletePunishment: async (id: string) => {
    return api(`/master/punishments/${id}`, {
      method: "DELETE",
    });
  },
};
