import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RtService } from "@/services/rt.service";
import type { RTPayload, RTBulkPayload, RTQueryParams } from "@/types/master-data";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const rtQK = {
  all: ["rts"] as const,
  lists: () => [...rtQK.all, "list"] as const,
  list: (params?: RTQueryParams) => [...rtQK.lists(), params] as const,
  details: () => [...rtQK.all, "detail"] as const,
  detail: (id: string) => [...rtQK.details(), id] as const,
};

export function useRts(params?: RTQueryParams) {
  return useQuery({
    queryKey: rtQK.list(params || {}),
    queryFn: () => RtService.getRts(params),
  });
}

export function useRt(id: string) {
  return useQuery({
    queryKey: rtQK.detail(id),
    queryFn: () => RtService.getRt(id),
    enabled: !!id,
  });
}

export function useCreateRt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RTPayload) => RtService.createRt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rtQK.all });
      toast.success("RT berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan RT");
    },
  });
}

export function useBulkCreateRts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RTBulkPayload) => RtService.bulkCreateRts(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rtQK.all });
      toast.success("RT berhasil ditambahkan secara massal");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan RT secara massal");
    },
  });
}

export function useUpdateRt(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RTPayload) => RtService.updateRt(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rtQK.all });
      toast.success("RT berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah RT");
    },
  });
}

export function useDeleteRt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RtService.deleteRt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rtQK.all });
      toast.success("RT berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus RT");
    },
  });
}

export function useMyRts() {
  return useQuery({
    queryKey: [...rtQK.all, "me"] as const,
    queryFn: () => RtService.getMyRts(),
  });
}
