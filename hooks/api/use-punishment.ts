import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PunishmentService } from "@/services/punishment.service";
import { PunishmentPayload } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export function usePunishments(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery({
    queryKey: ["punishments", params],
    queryFn: () => PunishmentService.getPunishments(params),
  });
}

export function useCreatePunishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PunishmentPayload) => PunishmentService.createPunishment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punishments"] });
      toast.success("Berhasil menambahkan punishment");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan punishment");
    },
  });
}

export function useUpdatePunishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PunishmentPayload }) =>
      PunishmentService.updatePunishment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punishments"] });
      toast.success("Berhasil mengubah punishment");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah punishment");
    },
  });
}

export function useDeletePunishment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PunishmentService.deletePunishment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["punishments"] });
      toast.success("Berhasil menghapus punishment");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus punishment");
    },
  });
}
