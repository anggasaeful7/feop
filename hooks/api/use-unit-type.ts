import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UnitTypeService } from "@/services/unit-type.service";
import type { UnitTypePayload, UnitTypeQueryParams } from "@/types/master-data";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const unitTypeQK = {
  all: ["unit-types"] as const,
  lists: () => [...unitTypeQK.all, "list"] as const,
  list: (params?: UnitTypeQueryParams) => [...unitTypeQK.lists(), params] as const,
  details: () => [...unitTypeQK.all, "detail"] as const,
  detail: (id: string) => [...unitTypeQK.details(), id] as const,
};

export function useUnitTypes(params?: UnitTypeQueryParams) {
  return useQuery({
    queryKey: unitTypeQK.list(params || {}),
    queryFn: () => UnitTypeService.getUnitTypes(params),
  });
}

export function useCreateUnitType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnitTypePayload) => UnitTypeService.createUnitType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitTypeQK.all });
      toast.success("Tipe unit berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan tipe unit");
    },
  });
}

export function useUpdateUnitType(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnitTypePayload) => UnitTypeService.updateUnitType(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitTypeQK.all });
      toast.success("Tipe unit berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah tipe unit");
    },
  });
}

export function useDeleteUnitType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UnitTypeService.deleteUnitType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitTypeQK.all });
      toast.success("Tipe unit berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus tipe unit");
    },
  });
}
