import { api } from "@/lib/axios";
import type { Paged } from "@/types";
import type {
  CleaningSchedule,
  CleaningSchedulePayload,
  SecuritySchedule,
  SecuritySchedulePayload,
  BulkCleaningSchedulePayload,
  BulkSecuritySchedulePayload,
} from "@/types/schedules";

export type ScheduleQueryParams = {
  page?: number;
  per_page?: number;
  date_from?: string;
  date_to?: string;
};

export const SchedulesService = {
  // Cleaning Schedules
  getCleaningSchedules: async (params?: ScheduleQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const path = `/api/v1/schedules/cleaning${query ? `?${query}` : ""}`;
    return api<Paged<CleaningSchedule>>(path);
  },

  getCleaningScheduleById: async (id: string) => {
    return api<CleaningSchedule>(`/api/v1/schedules/cleaning/${id}`);
  },

  createCleaningSchedule: async (payload: CleaningSchedulePayload) => {
    return api<CleaningSchedule>("/api/v1/schedules/cleaning", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createBulkCleaningSchedules: async (payload: BulkCleaningSchedulePayload) => {
    return api<CleaningSchedule[]>("/api/v1/schedules/cleaning/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCleaningSchedule: async (id: string, payload: CleaningSchedulePayload) => {
    return api<CleaningSchedule>(`/api/v1/schedules/cleaning/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteCleaningSchedule: async (id: string) => {
    return api(`/api/v1/schedules/cleaning/${id}`, {
      method: "DELETE",
    });
  },

  // Security Schedules
  getSecuritySchedules: async (params?: ScheduleQueryParams) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const path = `/api/v1/schedules/security${query ? `?${query}` : ""}`;
    return api<Paged<SecuritySchedule>>(path);
  },

  getSecurityScheduleById: async (id: string) => {
    return api<SecuritySchedule>(`/api/v1/schedules/security/${id}`);
  },

  createSecuritySchedule: async (payload: SecuritySchedulePayload) => {
    return api<SecuritySchedule>("/api/v1/schedules/security", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createBulkSecuritySchedules: async (payload: BulkSecuritySchedulePayload) => {
    return api<SecuritySchedule[]>("/api/v1/schedules/security/bulk", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateSecuritySchedule: async (id: string, payload: SecuritySchedulePayload) => {
    return api<SecuritySchedule>(`/api/v1/schedules/security/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteSecuritySchedule: async (id: string) => {
    return api(`/api/v1/schedules/security/${id}`, {
      method: "DELETE",
    });
  },
};
