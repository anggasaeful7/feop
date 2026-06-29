import { api } from "@/lib/axios";
import type { DashboardData, GetDashboardParams } from "@/types";

export const DashboardService = {
  getDashboard: async (params?: GetDashboardParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, String(value));
      });
    }
    const query = searchParams.toString();
    const path = `/dashboard${query ? `?${query}` : ""}`;
    return api<DashboardData>(path);
  },
};
