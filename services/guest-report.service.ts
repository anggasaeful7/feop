import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { GetGuestReportsParams, GuestReport } from "@/types/guest-report";

export const GuestReportService = {
  getGuestReports: async (params?: GetGuestReportsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.unit_id) searchParams.append("unit_id", params.unit_id);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page !== undefined) searchParams.append("page", params.page.toString());
    if (params?.per_page !== undefined) {
      searchParams.append("per_page", params.per_page.toString());
    } else {
      searchParams.append("per_page", "100");
    }
    return api<Paged<GuestReport>>(`/guest-reports?${searchParams.toString()}`);
  },

  getGuestReportDetail: async (id: string) => {
    return api<GuestReport>(`/guest-reports/${id}`);
  },

  getKtpUrl: async (id: string) => {
    return api<{ url: string }>(`/guest-reports/${id}/ktp-url`);
  },

  updateGuestReportNote: async (id: string, operator_note: string) => {
    return api<GuestReport>(`/guest-reports/${id}/note`, {
      method: "PATCH",
      body: JSON.stringify({ note: operator_note }),
    });
  },
};
