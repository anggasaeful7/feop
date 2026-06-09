import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { UnitType, UnitTypePayload, UnitTypeQueryParams } from "@/types/master-data";

export const UnitTypeService = {
  getUnitTypes: async (params?: UnitTypeQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    const path = `/master/unit-types${query ? `?${query}` : ""}`;
    return api<Paged<UnitType>>(path);
  },

  createUnitType: async (payload: UnitTypePayload) => {
    return api<UnitType>("/master/unit-types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUnitType: async (id: string, payload: UnitTypePayload) => {
    return api<UnitType>(`/master/unit-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteUnitType: async (id: string) => {
    return api(`/master/unit-types/${id}`, {
      method: "DELETE",
    });
  },
};
