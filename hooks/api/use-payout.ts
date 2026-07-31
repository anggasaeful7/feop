import { useQuery } from "@tanstack/react-query";
import { getPayoutLogs } from "@/services/payout.service";
import type { PayoutLogQueryParams } from "@/types/payout";

export const payoutQK = {
  all: ["payout-logs"] as const,
  lists: () => [...payoutQK.all, "list"] as const,
  list: (params?: PayoutLogQueryParams) => [...payoutQK.lists(), params] as const,
};

export function usePayoutLogs(params?: PayoutLogQueryParams) {
  return useQuery({
    queryKey: payoutQK.list(params),
    queryFn: () => getPayoutLogs(params),
    placeholderData: (prev) => prev,
  });
}
