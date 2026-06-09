import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { Unit, UnitPayload, UnitQueryParams, AssignBillComponentPayload, UnitBillComponentsMatrixResponse } from "@/types/master-data";

export const UnitService = {
  getUnits: async (params?: UnitQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    const path = `/master/units${query ? `?${query}` : ""}`;
    return api<Paged<Unit>>(path);
  },

  getUnit: async (id: string) => {
    return api<Unit>(`/master/units/${id}`);
  },

  createUnit: async (payload: UnitPayload) => {
    return api<Unit>("/master/units", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUnit: async (id: string, payload: UnitPayload) => {
    return api<Unit>(`/master/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteUnit: async (id: string) => {
    return api(`/master/units/${id}`, {
      method: "DELETE",
    });
  },

  getUnitBillComponentsMatrix: async (id: string) => {
    return api<UnitBillComponentsMatrixResponse>(`/master/units/${id}/bill-components/matrix`);
  },

  assignUnitBillComponents: async (id: string, payload: AssignBillComponentPayload) => {
    return api(`/master/units/${id}/bill-components`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
