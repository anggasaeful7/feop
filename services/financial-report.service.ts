import { api } from "@/lib/axios";
import type { FinancialReport, UpdateFinancialReportPayload } from "@/types/financial-report";
import type { Paged } from "@/types";

export async function getFinancialReports(params?: {
  page?: number;
  per_page?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return api<Paged<FinancialReport>>(`/api/v1/reports/financial${query}`);
}

export async function createFinancialReport(formData: FormData) {
  return api<FinancialReport>("/api/v1/reports/financial", {
    method: "POST",
    body: formData,
  });
}

export async function updateFinancialReport(id: string, payload: UpdateFinancialReportPayload) {
  return api<FinancialReport>(`/api/v1/reports/financial/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteFinancialReport(id: string) {
  return api(`/api/v1/reports/financial/${id}`, {
    method: "DELETE",
  });
}

export async function getFinancialReportDownloadUrl(id: string) {
  return api<{ url: string; file_name: string }>(
    `/api/v1/reports/financial/${id}/download-url`
  );
}
