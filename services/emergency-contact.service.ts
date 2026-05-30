import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { EmergencyContact, EmergencyContactPayload, EmergencyContactQueryParams } from "@/types/emergency-contact";

export const EmergencyContactService = {
  getContacts: async (params?: EmergencyContactQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const path = `/api/v1/workspace/contacts${query ? `?${query}` : ""}`;
    return api<Paged<EmergencyContact>>(path);
  },

  getContact: async (id: string) => {
    return api<EmergencyContact>(`/api/v1/workspace/contacts/${id}`);
  },

  createContact: async (payload: EmergencyContactPayload) => {
    return api<EmergencyContact>("/api/v1/workspace/contacts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateContact: async (id: string, payload: EmergencyContactPayload) => {
    return api<EmergencyContact>(`/api/v1/workspace/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteContact: async (id: string) => {
    return api(`/api/v1/workspace/contacts/${id}`, {
      method: "DELETE",
    });
  },
};
