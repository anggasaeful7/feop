import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EmergencyContactService } from "@/services/emergency-contact.service";
import type { EmergencyContactPayload, EmergencyContactQueryParams } from "@/types/emergency-contact";
import { toast } from "sonner";

export const emergencyContactQK = {
  all: ["emergency-contacts"] as const,
  lists: () => [...emergencyContactQK.all, "list"] as const,
  list: (params?: EmergencyContactQueryParams) => [...emergencyContactQK.lists(), params] as const,
  details: () => [...emergencyContactQK.all, "detail"] as const,
  detail: (id: string) => [...emergencyContactQK.details(), id] as const,
};

export function useEmergencyContacts(params?: EmergencyContactQueryParams) {
  return useQuery({
    queryKey: emergencyContactQK.list(params),
    queryFn: () => EmergencyContactService.getContacts(params),
  });
}

export function useEmergencyContact(id: string) {
  return useQuery({
    queryKey: emergencyContactQK.detail(id),
    queryFn: () => EmergencyContactService.getContact(id),
    enabled: !!id,
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmergencyContactPayload) => EmergencyContactService.createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyContactQK.lists() });
      toast.success("Kontak darurat berhasil ditambahkan");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan kontak darurat");
    },
  });
}

export function useUpdateEmergencyContact(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmergencyContactPayload) => EmergencyContactService.updateContact(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyContactQK.lists() });
      queryClient.invalidateQueries({ queryKey: emergencyContactQK.detail(id) });
      toast.success("Kontak darurat berhasil diperbarui");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui kontak darurat");
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => EmergencyContactService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyContactQK.lists() });
      toast.success("Kontak darurat berhasil dihapus");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus kontak darurat");
    },
  });
}
