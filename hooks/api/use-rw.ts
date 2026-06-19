import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RwService } from "@/services/rw.service";
import type { RWPayload, RWQueryParams } from "@/types/master-data";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const rwQK = {
  all: ["rws"] as const,
  lists: () => [...rwQK.all, "list"] as const,
  list: (params?: RWQueryParams) => [...rwQK.lists(), params] as const,
  details: () => [...rwQK.all, "detail"] as const,
  detail: (id: string) => [...rwQK.details(), id] as const,
};

export function useRws(params?: RWQueryParams) {
  return useQuery({
    queryKey: rwQK.list(params || {}),
    queryFn: () => RwService.getRws(params),
  });
}

export function useRw(id: string) {
  return useQuery({
    queryKey: rwQK.detail(id),
    queryFn: () => RwService.getRw(id),
    enabled: !!id,
  });
}

export function useCreateRw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RWPayload) => RwService.createRw(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rwQK.all });
      // Also invalidate rts list since RT is dependent on RW
      queryClient.invalidateQueries({ queryKey: ["rts"] });
      toast.success("RW berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan RW");
    },
  });
}

export function useUpdateRw(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RWPayload) => RwService.updateRw(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rwQK.all });
      queryClient.invalidateQueries({ queryKey: ["rts"] });
      toast.success("RW berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah RW");
    },
  });
}

export function useDeleteRw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RwService.deleteRw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rwQK.all });
      queryClient.invalidateQueries({ queryKey: ["rts"] });
      toast.success("RW berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus RW");
    },
  });
}
