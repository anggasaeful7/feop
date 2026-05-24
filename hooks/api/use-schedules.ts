import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SchedulesService, type ScheduleQueryParams } from "@/services/schedules.service";
import type { CleaningSchedulePayload, SecuritySchedulePayload, BulkCleaningSchedulePayload, BulkSecuritySchedulePayload } from "@/types/schedules";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

// Query Keys
export const cleaningScheduleQK = {
  all: ["cleaning-schedules"] as const,
  lists: () => [...cleaningScheduleQK.all, "list"] as const,
  list: (params?: ScheduleQueryParams) => [...cleaningScheduleQK.lists(), params] as const,
  details: () => [...cleaningScheduleQK.all, "detail"] as const,
  detail: (id: string) => [...cleaningScheduleQK.details(), id] as const,
};

export const securityScheduleQK = {
  all: ["security-schedules"] as const,
  lists: () => [...securityScheduleQK.all, "list"] as const,
  list: (params?: ScheduleQueryParams) => [...securityScheduleQK.lists(), params] as const,
  details: () => [...securityScheduleQK.all, "detail"] as const,
  detail: (id: string) => [...securityScheduleQK.details(), id] as const,
};

// --- Cleaning Schedules Hooks ---

export function useCleaningSchedules(params?: ScheduleQueryParams) {
  return useQuery({
    queryKey: cleaningScheduleQK.list(params || {}),
    queryFn: () => SchedulesService.getCleaningSchedules(params),
  });
}

export function useCleaningSchedule(id: string) {
  return useQuery({
    queryKey: cleaningScheduleQK.detail(id),
    queryFn: () => SchedulesService.getCleaningScheduleById(id),
    enabled: !!id,
  });
}

export function useCreateCleaningSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CleaningSchedulePayload) => SchedulesService.createCleaningSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningScheduleQK.all });
      toast.success("Jadwal kebersihan berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan jadwal kebersihan");
    },
  });
}

export function useCreateBulkCleaningSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkCleaningSchedulePayload) => SchedulesService.createBulkCleaningSchedules(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningScheduleQK.all });
      toast.success("Beberapa jadwal kebersihan berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan jadwal kebersihan massal");
    },
  });
}

export function useUpdateCleaningSchedule(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CleaningSchedulePayload) => SchedulesService.updateCleaningSchedule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningScheduleQK.all });
      toast.success("Jadwal kebersihan berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah jadwal kebersihan");
    },
  });
}

export function useDeleteCleaningSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SchedulesService.deleteCleaningSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cleaningScheduleQK.all });
      toast.success("Jadwal kebersihan berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus jadwal kebersihan");
    },
  });
}

// --- Security Schedules Hooks ---

export function useSecuritySchedules(params?: ScheduleQueryParams) {
  return useQuery({
    queryKey: securityScheduleQK.list(params || {}),
    queryFn: () => SchedulesService.getSecuritySchedules(params),
  });
}

export function useSecuritySchedule(id: string) {
  return useQuery({
    queryKey: securityScheduleQK.detail(id),
    queryFn: () => SchedulesService.getSecurityScheduleById(id),
    enabled: !!id,
  });
}

export function useCreateSecuritySchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SecuritySchedulePayload) => SchedulesService.createSecuritySchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityScheduleQK.all });
      toast.success("Jadwal keamanan berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan jadwal keamanan");
    },
  });
}

export function useCreateBulkSecuritySchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkSecuritySchedulePayload) => SchedulesService.createBulkSecuritySchedules(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityScheduleQK.all });
      toast.success("Beberapa jadwal keamanan berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan jadwal keamanan massal");
    },
  });
}

export function useUpdateSecuritySchedule(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SecuritySchedulePayload) => SchedulesService.updateSecuritySchedule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityScheduleQK.all });
      toast.success("Jadwal keamanan berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah jadwal keamanan");
    },
  });
}

export function useDeleteSecuritySchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SchedulesService.deleteSecuritySchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securityScheduleQK.all });
      toast.success("Jadwal keamanan berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus jadwal keamanan");
    },
  });
}
