import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { BillComponent, BillComponentPayload } from "@/types/master-data";

export const BillComponentService = {
  getBillComponents: async (search?: string, active?: boolean, page?: number, per_page?: number) => {
    const searchParams = new URLSearchParams();
    if (search) searchParams.append("search", search);
    if (active !== undefined) searchParams.append("active", active.toString());
    if (page !== undefined) searchParams.append("page", page.toString());
    if (per_page !== undefined) searchParams.append("per_page", per_page.toString());
    else searchParams.append("per_page", "100");
    return api<Paged<BillComponent>>(`/api/v1/master/bill-components?${searchParams.toString()}`);
  },

  createBillComponent: async (payload: BillComponentPayload) => {
    return api<BillComponent>("/api/v1/master/bill-components", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateBillComponent: async (id: string, payload: BillComponentPayload) => {
    return api<BillComponent>(`/api/v1/master/bill-components/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteBillComponent: async (id: string) => {
    return api(`/api/v1/master/bill-components/${id}`, {
      method: "DELETE",
    });
  },

  assignComponents: async (unitId: string, payload: { component_ids: string[] }) => {
    return api(`/api/v1/master/units/${unitId}/bill-components`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

