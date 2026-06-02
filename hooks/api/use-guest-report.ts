import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GuestReportService } from "@/services/guest-report.service";
import type { GetGuestReportsParams } from "@/types/guest-report";

export const guestReportQK = {
  all: ["guest-reports"] as const,
  lists: () => [...guestReportQK.all, "list"] as const,
  list: (params?: GetGuestReportsParams) =>
    [...guestReportQK.lists(), params] as const,
  details: () => [...guestReportQK.all, "detail"] as const,
  detail: (id: string) => [...guestReportQK.details(), id] as const,
};

export function useGuestReports(params?: GetGuestReportsParams) {
  return useQuery({
    queryKey: guestReportQK.list(params),
    queryFn: () => GuestReportService.getGuestReports(params),
  });
}

export function useGuestReportDetail(id: string) {
  return useQuery({
    queryKey: guestReportQK.detail(id),
    queryFn: () => GuestReportService.getGuestReportDetail(id),
    enabled: !!id,
  });
}

export function useUpdateGuestReportNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, operator_note }: { id: string; operator_note: string }) =>
      GuestReportService.updateGuestReportNote(id, operator_note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestReportQK.all });
    },
  });
}
