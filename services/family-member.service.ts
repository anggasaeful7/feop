import { api, axiosInstance, ApiError } from "@/lib/axios";
import type { ApiErrorBody } from "@/types";
import type { FamilyMember } from "@/types/master-data";
import axios, { AxiosError } from "axios";

export const FamilyMemberService = {
  getFamilyMembers: async (personId: string) => {
    return api<{ items: FamilyMember[] }>(`/master/persons/${personId}/family-members`);
  },

  createFamilyMember: async (personId: string, formData: FormData) => {
    try {
      const res = await axiosInstance.post(`/master/persons/${personId}/family-members`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data as FamilyMember;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorBody>;
        const status = axiosError.response?.status || 500;
        const body = axiosError.response?.data;

        if (body && "error" in body) {
          throw new ApiError(status, body.error);
        }

        throw new ApiError(status, {
          code: "unknown",
          message: axiosError.message || `Request failed (${status})`,
        });
      }
      throw error;
    }
  },

  getFamilyMemberDetail: async (personId: string, familyMemberId: string) => {
    return api<FamilyMember>(`/master/persons/${personId}/family-members/${familyMemberId}`);
  },

  updateFamilyMember: async (personId: string, familyMemberId: string, formData: FormData) => {
    try {
      const res = await axiosInstance.put(`/master/persons/${personId}/family-members/${familyMemberId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data as FamilyMember;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorBody>;
        const status = axiosError.response?.status || 500;
        const body = axiosError.response?.data;

        if (body && "error" in body) {
          throw new ApiError(status, body.error);
        }

        throw new ApiError(status, {
          code: "unknown",
          message: axiosError.message || `Request failed (${status})`,
        });
      }
      throw error;
    }
  },

  deleteFamilyMember: async (personId: string, familyMemberId: string) => {
    return api(`/master/persons/${personId}/family-members/${familyMemberId}`, {
      method: "DELETE",
    });
  },

  getPictureUrl: async (personId: string, familyMemberId: string) => {
    return api<{ url: string; file_name: string; expires_at: string }>(
      `/master/persons/${personId}/family-members/${familyMemberId}/picture-url`
    );
  },
};
