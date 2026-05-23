import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BillComponentService } from "@/services/bill-component.service";
import type { BillComponentPayload } from "@/types/master-data";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const billComponentQK = {
  all: ["bill-components"] as const,
  lists: () => [...billComponentQK.all, "list"] as const,
  list: (params?: { search?: string; active?: boolean; page?: number; per_page?: number }) =>
    [...billComponentQK.lists(), params] as const,
  details: () => [...billComponentQK.all, "detail"] as const,
  detail: (id: string) => [...billComponentQK.details(), id] as const,
};

export function useBillComponents(params?: { search?: string; active?: boolean; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: billComponentQK.list(params),
    queryFn: () => BillComponentService.getBillComponents(params?.search, params?.active, params?.page, params?.per_page),
  });
}

export function useCreateBillComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BillComponentPayload) => BillComponentService.createBillComponent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billComponentQK.all });
      toast.success("Komponen tagihan berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan komponen tagihan");
    },
  });
}

export function useUpdateBillComponent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BillComponentPayload) => BillComponentService.updateBillComponent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billComponentQK.all });
      toast.success("Komponen tagihan berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah komponen tagihan");
    },
  });
}

export function useDeleteBillComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BillComponentService.deleteBillComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billComponentQK.all });
      toast.success("Komponen tagihan berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus komponen tagihan");
    },
  });
}

export function useAssignBillComponents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { component_ids: string[]; unit_ids: string[] }) => {
      return BillComponentService.assignComponents(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billComponentQK.all });
      queryClient.invalidateQueries({ queryKey: ["units"] });
      toast.success("Berhasil assign komponen ke unit");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal assign komponen");
    },
  });
}
