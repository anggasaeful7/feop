import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OfficerService } from "@/services/petugas.service";
import type { OfficerPayload, OfficerQueryParams } from "@/types/master-data";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const officerQK = {
  all: ["officers"] as const,
  lists: () => [...officerQK.all, "list"] as const,
  list: (params?: OfficerQueryParams) => [...officerQK.lists(), params] as const,
  details: () => [...officerQK.all, "detail"] as const,
  detail: (id: string) => [...officerQK.details(), id] as const,
};

export function useOfficers(params?: OfficerQueryParams) {
  return useQuery({
    queryKey: officerQK.list(params || {}),
    queryFn: () => OfficerService.getOfficers(params),
  });
}

export function useOfficer(id: string) {
  return useQuery({
    queryKey: officerQK.detail(id),
    queryFn: () => OfficerService.getOfficer(id),
    enabled: !!id,
  });
}

export function useCreateOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OfficerPayload) => OfficerService.createOfficer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officerQK.all });
      toast.success("Petugas berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan petugas");
    },
  });
}

export function useUpdateOfficer(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OfficerPayload) => OfficerService.updateOfficer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officerQK.all });
      toast.success("Petugas berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah petugas");
    },
  });
}

export function useDeleteOfficer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => OfficerService.deleteOfficer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: officerQK.all });
      toast.success("Petugas berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus petugas");
    },
  });
}
