import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UnitService } from "@/services/unit.service";
import type { UnitPayload, UnitQueryParams } from "@/types/master-data";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const unitQK = {
  all: ["units"] as const,
  lists: () => [...unitQK.all, "list"] as const,
  list: (params?: UnitQueryParams) => [...unitQK.lists(), params] as const,
  details: () => [...unitQK.all, "detail"] as const,
  detail: (id: string) => [...unitQK.details(), id] as const,
};

export function useUnits(params?: UnitQueryParams) {
  return useQuery({
    queryKey: unitQK.list(params || {}),
    queryFn: () => UnitService.getUnits(params),
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnitPayload) => UnitService.createUnit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitQK.all });
      toast.success("Unit berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan unit");
    },
  });
}

export function useUpdateUnit(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnitPayload) => UnitService.updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitQK.all });
      toast.success("Unit berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah unit");
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UnitService.deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitQK.all });
      toast.success("Unit berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus unit");
    },
  });
}
