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
    const path = `/api/v1/master/units${query ? `?${query}` : ""}`;
    return api<Paged<Unit>>(path);
  },

  getUnit: async (id: string) => {
    return api<Unit>(`/api/v1/master/units/${id}`);
  },

  createUnit: async (payload: UnitPayload) => {
    return api<Unit>("/api/v1/master/units", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUnit: async (id: string, payload: UnitPayload) => {
    return api<Unit>(`/api/v1/master/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteUnit: async (id: string) => {
    return api(`/api/v1/master/units/${id}`, {
      method: "DELETE",
    });
  },

  getUnitBillComponentsMatrix: async (id: string) => {
    return api<UnitBillComponentsMatrixResponse>(`/api/v1/master/units/${id}/bill-components/matrix`);
  },

  assignUnitBillComponents: async (id: string, payload: AssignBillComponentPayload) => {
    return api(`/api/v1/master/units/${id}/bill-components`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
