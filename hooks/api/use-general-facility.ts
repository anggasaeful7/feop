import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GeneralFacilityService } from "@/services/general-facility.service";
import { AssignGeneralFacilityPayload, GeneralFacilityPayload } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export function useGeneralFacilities(params?: { page?: number; per_page?: number; search?: string }) {
  return useQuery({
    queryKey: ["general-facilities", params],
    queryFn: () => GeneralFacilityService.getGeneralFacilities(params),
  });
}

export function useGeneralFacilitiesByUnit(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  year?: number | string;
  unit_id?: string;
  unit?: string;
  name?: string;
  is_late?: boolean | string;
  rw?: string;
  rt?: string;
  overdue_months?: number;
}) {
  return useQuery({
    queryKey: ["general-facilities", "by-unit", params],
    queryFn: () => GeneralFacilityService.getGeneralFacilitiesByUnit(params),
  });
}

export function useCreateGeneralFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GeneralFacilityPayload) => GeneralFacilityService.createGeneralFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-facilities"] });
      toast.success("Berhasil menambahkan fasilitas");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan fasilitas");
    },
  });
}

export function useUpdateGeneralFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GeneralFacilityPayload }) =>
      GeneralFacilityService.updateGeneralFacility(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-facilities"] });
      toast.success("Berhasil mengubah fasilitas");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah fasilitas");
    },
  });
}

export function useDeleteGeneralFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GeneralFacilityService.deleteGeneralFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-facilities"] });
      toast.success("Berhasil menghapus fasilitas");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus fasilitas");
    },
  });
}

export function useAssignGeneralFacility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignGeneralFacilityPayload) => GeneralFacilityService.assignGeneralFacility(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["general-facilities"] });
      toast.success("Berhasil assign fasilitas");
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal assign fasilitas");
    },
  });
}
