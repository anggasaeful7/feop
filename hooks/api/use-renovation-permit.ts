import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RenovationPermitService } from "@/services/renovation-permit.service";
import type {
  GetRenovationPermitsParams,
  RejectRenovationPermitPayload
} from "@/types/renovation-permit";

export const renovationPermitQK = {
  all: ["renovation-permits"] as const,
  lists: () => [...renovationPermitQK.all, "list"] as const,
  list: (params?: GetRenovationPermitsParams) => [...renovationPermitQK.lists(), params] as const,
  details: () => [...renovationPermitQK.all, "detail"] as const,
  detail: (id: string) => [...renovationPermitQK.details(), id] as const,
  documentUrls: () => [...renovationPermitQK.all, "documentUrl"] as const,
  documentUrl: (id: string, documentId: string) => [...renovationPermitQK.documentUrls(), id, documentId] as const,
  resultUrls: () => [...renovationPermitQK.all, "resultUrl"] as const,
  resultUrl: (id: string) => [...renovationPermitQK.resultUrls(), id] as const,
};

export function useRenovationPermits(params?: GetRenovationPermitsParams) {
  return useQuery({
    queryKey: renovationPermitQK.list(params),
    queryFn: () => RenovationPermitService.getRenovationPermits(params),
  });
}

export function useRenovationPermitDetail(id: string) {
  return useQuery({
    queryKey: renovationPermitQK.detail(id),
    queryFn: () => RenovationPermitService.getRenovationPermitDetail(id),
    enabled: !!id,
  });
}

export function useApproveRenovationPermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file?: File | null }) =>
      RenovationPermitService.approveRenovationPermit(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: renovationPermitQK.all });
    },
  });
}

export function useRejectRenovationPermit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectRenovationPermitPayload }) =>
      RenovationPermitService.rejectRenovationPermit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: renovationPermitQK.all });
    },
  });
}

export function useRenovationPermitDocumentUrl(id: string, documentId: string, enabled = true) {
  return useQuery({
    queryKey: renovationPermitQK.documentUrl(id, documentId),
    queryFn: () => RenovationPermitService.getDocumentUrl(id, documentId),
    enabled: !!id && !!documentId && enabled,
  });
}

export function useRenovationPermitResultUrl(id: string, enabled = true) {
  return useQuery({
    queryKey: renovationPermitQK.resultUrl(id),
    queryFn: () => RenovationPermitService.getResultUrl(id),
    enabled: !!id && enabled,
  });
}
