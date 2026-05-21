import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PersonService } from "@/services/person.service";
import type { PersonPayload } from "@/types/master-data";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const personQK = {
  all: ["persons"] as const,
  lists: () => [...personQK.all, "list"] as const,
  list: (role?: string) => [...personQK.lists(), role] as const,
  details: () => [...personQK.all, "detail"] as const,
  detail: (id: string) => [...personQK.details(), id] as const,
};

export function usePersons(role?: string) {
  return useQuery({
    queryKey: personQK.list(role),
    queryFn: () => PersonService.getPersons(role),
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PersonPayload) => PersonService.createPerson(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personQK.all });
      toast.success("Warga berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan warga");
    },
  });
}

export function useUpdatePerson(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PersonPayload) => PersonService.updatePerson(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personQK.all });
      toast.success("Warga berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah warga");
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PersonService.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personQK.all });
      toast.success("Warga berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus warga");
    },
  });
}
