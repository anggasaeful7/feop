import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type {
  RenovationPermit,
  GetRenovationPermitsParams,
  RejectRenovationPermitPayload
} from "@/types/renovation-permit";

export const RenovationPermitService = {
  getRenovationPermits: async (params?: GetRenovationPermitsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.per_page) searchParams.set("per_page", params.per_page.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);

    const qs = searchParams.toString();
    const url = `/api/v1/renovation-permits${qs ? `?${qs}` : ""}`;

    return api<Paged<RenovationPermit>>(url);
  },

  getRenovationPermitDetail: async (id: string) => {
    return api<RenovationPermit>(`/api/v1/renovation-permits/${id}`);
  },

  approveRenovationPermit: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append("result_file", file);

    return api<void>(`/api/v1/renovation-permits/${id}/approve`, {
      method: "PATCH",
      body: formData,
    });
  },

  rejectRenovationPermit: async (id: string, payload: RejectRenovationPermitPayload) => {
    return api<void>(`/api/v1/renovation-permits/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  getDocumentUrl: async (id: string, documentId: string) => {
    return api<{ url: string }>(`/api/v1/renovation-permits/${id}/documents/${documentId}/url`);
  },

  getResultUrl: async (id: string) => {
    return api<{ url: string }>(`/api/v1/renovation-permits/${id}/result-url`);
  }
};
