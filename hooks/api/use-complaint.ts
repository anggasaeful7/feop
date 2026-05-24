import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ComplaintService } from "@/services/complaint.service";
import type { GetComplaintsParams, UpdateComplaintPayload } from "@/types/complaint";

export const complaintQK = {
  all: ["complaints"] as const,
  lists: () => [...complaintQK.all, "list"] as const,
  list: (params?: GetComplaintsParams) =>
    [...complaintQK.lists(), params] as const,
  details: () => [...complaintQK.all, "detail"] as const,
  detail: (id: string) => [...complaintQK.details(), id] as const,
  photoUrl: (id: string) => [...complaintQK.detail(id), "photo-url"] as const,
};

export function useComplaints(params?: GetComplaintsParams) {
  return useQuery({
    queryKey: complaintQK.list(params),
    queryFn: () => ComplaintService.getComplaints(params),
  });
}

export function useComplaintDetail(id: string) {
  return useQuery({
    queryKey: complaintQK.detail(id),
    queryFn: () => ComplaintService.getComplaintDetail(id),
    enabled: !!id,
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateComplaintPayload }) =>
      ComplaintService.updateComplaint(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintQK.all });
    },
  });
}

export function useComplaintPhotoUrl(id: string, enabled = true) {
  return useQuery({
    queryKey: complaintQK.photoUrl(id),
    queryFn: () => ComplaintService.getPhotoUrl(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
