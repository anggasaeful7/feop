import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LetterRequestService } from "@/services/letter-request.service";
import type {
  GetLetterRequestsParams,
  RejectLetterRequestPayload,
} from "@/types/letter-request";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const letterRequestQK = {
  all: ["letter-requests"] as const,
  lists: () => [...letterRequestQK.all, "list"] as const,
  list: (params?: GetLetterRequestsParams) =>
    [...letterRequestQK.lists(), params] as const,
  details: () => [...letterRequestQK.all, "detail"] as const,
  detail: (id: string) => [...letterRequestQK.details(), id] as const,
};

export function useLetterRequests(params?: GetLetterRequestsParams) {
  return useQuery({
    queryKey: letterRequestQK.list(params),
    queryFn: () => LetterRequestService.getLetterRequests(params),
  });
}

export function useLetterRequestDetail(id: string) {
  return useQuery({
    queryKey: letterRequestQK.detail(id),
    queryFn: () => LetterRequestService.getLetterRequestDetail(id),
    enabled: !!id,
  });
}

export function useApproveLetterRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file?: File | null) =>
      LetterRequestService.approveLetterRequest(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: letterRequestQK.all });
      toast.success("Pengajuan surat berhasil disetujui");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Gagal menyetujui pengajuan surat"
      );
    },
  });
}

export function useRejectLetterRequest(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RejectLetterRequestPayload) =>
      LetterRequestService.rejectLetterRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: letterRequestQK.all });
      toast.success("Pengajuan surat berhasil ditolak");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Gagal menolak pengajuan surat"
      );
    },
  });
}
