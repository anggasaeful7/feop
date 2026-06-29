import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.service";
import type { GetDashboardParams } from "@/types";

export const dashboardQK = {
  all: ["dashboard"] as const,
  data: (params?: GetDashboardParams) => ["dashboard", "data", params] as const,
};

export function useDashboard(params?: GetDashboardParams) {
  return useQuery({
    queryKey: dashboardQK.data(params),
    queryFn: () => DashboardService.getDashboard(params),
  });
}
