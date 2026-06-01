import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getResidentBills,
  getResidentBill,
  approveResidentBill,
  rejectResidentBill,
  deleteResidentBill,
  getResidentBillsByUnit,
} from "@/services/resident-bill.service";
import type { ResidentBillQueryParams, ResidentBillByUnitQueryParams } from "@/types/billing";

export const residentBillQK = {
  all: ["resident-bills"] as const,
  lists: () => [...residentBillQK.all, "list"] as const,
  list: (params?: ResidentBillQueryParams) => [...residentBillQK.lists(), params] as const,
  byUnits: () => [...residentBillQK.all, "by-unit-list"] as const,
  byUnit: (params?: ResidentBillByUnitQueryParams) => [...residentBillQK.byUnits(), params] as const,
  details: () => [...residentBillQK.all, "detail"] as const,
  detail: (id: string) => [...residentBillQK.details(), id] as const,
};

export function useResidentBills(params?: ResidentBillQueryParams) {
  return useQuery({
    queryKey: residentBillQK.list(params),
    queryFn: () => getResidentBills(params),
    placeholderData: (prev) => prev,
  });
}

export function useResidentBillsByUnit(params?: ResidentBillByUnitQueryParams) {
  return useQuery({
    queryKey: residentBillQK.byUnit(params),
    queryFn: () => getResidentBillsByUnit(params),
    placeholderData: (prev) => prev,
  });
}

export function useResidentBill(id: string) {
  return useQuery({
    queryKey: residentBillQK.detail(id),
    queryFn: () => getResidentBill(id),
    enabled: !!id,
  });
}

export function useApproveResidentBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveResidentBill,
    onSuccess: (_, variables) => {
      toast.success("Pembayaran berhasil diverifikasi & ditandai lunas");
      qc.invalidateQueries({ queryKey: residentBillQK.detail(variables.id) });
      qc.invalidateQueries({ queryKey: residentBillQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memverifikasi pembayaran");
    },
  });
}

export function useRejectResidentBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectResidentBill,
    onSuccess: (_, variables) => {
      toast.success("Bukti transfer berhasil ditolak");
      qc.invalidateQueries({ queryKey: residentBillQK.detail(variables.id) });
      qc.invalidateQueries({ queryKey: residentBillQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menolak bukti transfer");
    },
  });
}

export function useDeleteResidentBill() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteResidentBill,
    onSuccess: () => {
      toast.success("Tagihan berhasil dihapus");
      qc.invalidateQueries({ queryKey: residentBillQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus tagihan");
    },
  });
}
