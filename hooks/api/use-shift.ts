import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ShiftService } from "@/services/shift.service";
import type { ShiftPayload, ShiftQueryParams } from "@/types/master-data";
import { ApiError } from "@/lib/axios";

export const SHIFT_QUERY_KEY = "shifts";

export function useShifts(params?: ShiftQueryParams) {
  return useQuery({
    queryKey: [SHIFT_QUERY_KEY, params],
    queryFn: () => ShiftService.getShifts(params),
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ShiftPayload) => ShiftService.createShift(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFT_QUERY_KEY] });
      toast.success("Shift berhasil ditambahkan");
    },
    onError: (error) => {
      const msg = error instanceof ApiError ? error.message : "Terjadi kesalahan";
      toast.error(msg);
    },
  });
}

export function useUpdateShift(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ShiftPayload) => ShiftService.updateShift(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFT_QUERY_KEY] });
      toast.success("Shift berhasil diperbarui");
    },
    onError: (error) => {
      const msg = error instanceof ApiError ? error.message : "Terjadi kesalahan";
      toast.error(msg);
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ShiftService.deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFT_QUERY_KEY] });
      toast.success("Shift berhasil dihapus");
    },
    onError: (error) => {
      const msg = error instanceof ApiError ? error.message : "Terjadi kesalahan";
      toast.error(msg);
    },
  });
}
