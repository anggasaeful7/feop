import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type {
  GetLetterRequestsParams,
  LetterRequest,
  RejectLetterRequestPayload,
} from "@/types/letter-request";

export const LetterRequestService = {
  getLetterRequests: async (params?: GetLetterRequestsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.unit_id) searchParams.append("unit_id", params.unit_id);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page !== undefined) searchParams.append("page", params.page.toString());
    if (params?.per_page !== undefined) {
      searchParams.append("per_page", params.per_page.toString());
    } else {
      searchParams.append("per_page", "100");
    }
    return api<Paged<LetterRequest>>(`/letter-requests?${searchParams.toString()}`);
  },

  getLetterRequestDetail: async (id: string) => {
    return api<LetterRequest>(`/letter-requests/${id}`);
  },

  approveLetterRequest: async (id: string, file?: File | null) => {
    const formData = new FormData();
    if (file) {
      formData.append("result_file", file);
    }
    return api<LetterRequest>(`/letter-requests/${id}/approve`, {
      method: "PATCH",
      body: formData as unknown as BodyInit,
    });
  },

  rejectLetterRequest: async (id: string, payload: RejectLetterRequestPayload) => {
    return api<LetterRequest>(`/letter-requests/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getAttachmentUrl: async (id: string, attachmentId: string) => {
    return api<{ url: string }>(`/letter-requests/${id}/attachments/${attachmentId}/url`);
  },

  getResultUrl: async (id: string) => {
    return api<{ url: string }>(`/letter-requests/${id}/result-url`);
  },
};
