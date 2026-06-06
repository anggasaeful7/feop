import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getFinancialReports,
  createFinancialReport,
  updateFinancialReport,
  deleteFinancialReport,
  getFinancialReportDownloadUrl,
} from "@/services/financial-report.service";
import type { UpdateFinancialReportPayload } from "@/types/financial-report";

export const financialReportQK = {
  all: ["financial-reports"] as const,
  lists: () => [...financialReportQK.all, "list"] as const,
  list: (params?: Record<string, string | number | boolean | null | undefined>) =>
    [...financialReportQK.lists(), params] as const,
  details: () => [...financialReportQK.all, "detail"] as const,
  detail: (id: string) => [...financialReportQK.details(), id] as const,
};

export function useFinancialReports(params?: { page?: number; per_page?: number }) {
  return useQuery({
    queryKey: financialReportQK.list(params),
    queryFn: () => getFinancialReports(params),
  });
}

export function useCreateFinancialReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFinancialReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financialReportQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengunggah laporan");
    },
  });
}

export function useUpdateFinancialReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFinancialReportPayload }) => updateFinancialReport(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financialReportQK.lists() });
      queryClient.invalidateQueries({ queryKey: financialReportQK.detail(id) });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal memperbarui laporan");
    },
  });
}

export function useDeleteFinancialReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFinancialReport,
    onSuccess: () => {
      toast.success("Laporan berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: financialReportQK.lists() });
    },
    onError: (error) => {
      toast.error(error.message || "Gagal menghapus laporan");
    },
  });
}

export function useDownloadFinancialReport() {
  return useMutation({
    mutationFn: getFinancialReportDownloadUrl,
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Gagal mengunduh laporan");
    },
  });
}
