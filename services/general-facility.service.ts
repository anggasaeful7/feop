import { api } from "@/lib/axios";
import {
  Paged,
  GeneralFacility,
  GeneralFacilityPayload,
  AssignGeneralFacilityPayload,
  UnitWithGeneralFacilities,
} from "@/types";

export const GeneralFacilityService = {
  getGeneralFacilities: async (params?: { page?: number; per_page?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const path = `/master/general-facilities${query ? `?${query}` : ""}`;
    return api<Paged<GeneralFacility>>(path);
  },

  getGeneralFacility: async (id: string) => {
    return api<GeneralFacility>(`/master/general-facilities/${id}`);
  },

  createGeneralFacility: async (payload: GeneralFacilityPayload) => {
    return api<GeneralFacility>("/master/general-facilities", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateGeneralFacility: async (id: string, payload: GeneralFacilityPayload) => {
    return api<GeneralFacility>(`/master/general-facilities/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteGeneralFacility: async (id: string) => {
    return api(`/master/general-facilities/${id}`, {
      method: "DELETE",
    });
  },

  assignGeneralFacility: async (payload: AssignGeneralFacilityPayload) => {
    return api("/master/units/general-facilities/assign", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getGeneralFacilitiesByUnit: async (params?: { page?: number; per_page?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const path = `/master/general-facilities/by-unit${query ? `?${query}` : ""}`;
    return api<Paged<UnitWithGeneralFacilities>>(path);
  },
};
