import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type { Complaint, GetComplaintsParams, UpdateComplaintPayload } from "@/types/complaint";

export const ComplaintService = {
  getComplaints: async (params?: GetComplaintsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.urgency) searchParams.append("urgency", params.urgency);
    if (params?.unit_id) searchParams.append("unit_id", params.unit_id);
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page !== undefined) searchParams.append("page", params.page.toString());
    if (params?.per_page !== undefined) {
      searchParams.append("per_page", params.per_page.toString());
    } else {
      searchParams.append("per_page", "100");
    }
    return api<Paged<Complaint>>(`/api/v1/complaints?${searchParams.toString()}`);
  },

  getComplaintDetail: async (id: string) => {
    return api<Complaint>(`/api/v1/complaints/${id}`);
  },

  updateComplaint: async (id: string, payload: UpdateComplaintPayload) => {
    return api<Complaint>(`/api/v1/complaints/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  getPhotoUrl: async (id: string) => {
    return api<{ url: string; expires_at: string; file_name: string }>(
      `/api/v1/complaints/${id}/photo-url`
    );
  },
};
