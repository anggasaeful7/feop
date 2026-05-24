import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getSpecificBillings,
  getSpecificBilling,
  createSpecificBilling,
  updateSpecificBilling,
  deleteSpecificBilling,
  toggleSpecificBillingActive,
  issueSpecificBilling,
} from "@/services/specific-billing.service";
import type { SpecificBillingQueryParams } from "@/types/specific-billing";

export const specificBillingQK = {
  all: ["specific-billings"] as const,
  lists: () => [...specificBillingQK.all, "list"] as const,
  list: (params?: SpecificBillingQueryParams) => [...specificBillingQK.lists(), params] as const,
  details: () => [...specificBillingQK.all, "detail"] as const,
  detail: (id: string) => [...specificBillingQK.details(), id] as const,
};

export function useSpecificBillings(params?: SpecificBillingQueryParams) {
  return useQuery({
    queryKey: specificBillingQK.list(params),
    queryFn: () => getSpecificBillings(params),
    placeholderData: (prev) => prev,
  });
}

export function useSpecificBilling(id: string) {
  return useQuery({
    queryKey: specificBillingQK.detail(id),
    queryFn: () => getSpecificBilling(id),
    enabled: !!id,
  });
}

export function useCreateSpecificBilling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSpecificBilling,
    onSuccess: () => {
      toast.success("Berhasil menambahkan tagihan spesifik");
      qc.invalidateQueries({ queryKey: specificBillingQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menambahkan tagihan spesifik");
    },
  });
}

export function useUpdateSpecificBilling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSpecificBilling,
    onSuccess: (_, variables) => {
      toast.success("Berhasil memperbarui tagihan spesifik");
      qc.invalidateQueries({ queryKey: specificBillingQK.detail(variables.id) });
      qc.invalidateQueries({ queryKey: specificBillingQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui tagihan spesifik");
    },
  });
}

export function useToggleSpecificBillingActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleSpecificBillingActive,
    onSuccess: (_, id) => {
      toast.success("Berhasil mengubah status aktif");
      qc.invalidateQueries({ queryKey: specificBillingQK.detail(id) });
      qc.invalidateQueries({ queryKey: specificBillingQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengubah status aktif");
    },
  });
}

export function useDeleteSpecificBilling() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSpecificBilling,
    onSuccess: () => {
      toast.success("Berhasil menghapus tagihan spesifik");
      qc.invalidateQueries({ queryKey: specificBillingQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus tagihan spesifik");
    },
  });
}

export function useIssueSpecificBilling() {
  return useMutation({
    mutationFn: issueSpecificBilling,
    onSuccess: () => {
      toast.success("Berhasil men-generate tagihan");
    },
    onError: (error) => {
      toast.error(error.message || "Gagal men-generate tagihan");
    },
  });
}
