import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FamilyMemberService } from "@/services/family-member.service";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const familyMemberQK = {
  all: (personId: string) => ["family-members", personId] as const,
  lists: (personId: string) => [...familyMemberQK.all(personId), "list"] as const,
  details: (personId: string) => [...familyMemberQK.all(personId), "detail"] as const,
  detail: (personId: string, id: string) => [...familyMemberQK.details(personId), id] as const,
  pictureUrl: (personId: string, id: string) => [...familyMemberQK.detail(personId, id), "pictureUrl"] as const,
};

export function useFamilyMembers(personId: string) {
  return useQuery({
    queryKey: familyMemberQK.lists(personId),
    queryFn: () => FamilyMemberService.getFamilyMembers(personId),
    enabled: !!personId,
  });
}

export function useCreateFamilyMember(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => FamilyMemberService.createFamilyMember(personId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyMemberQK.all(personId) });
      toast.success("Anggota keluarga berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan anggota keluarga");
    },
  });
}

export function useUpdateFamilyMember(personId: string, familyMemberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => FamilyMemberService.updateFamilyMember(personId, familyMemberId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyMemberQK.all(personId) });
      toast.success("Anggota keluarga berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah anggota keluarga");
    },
  });
}

export function useDeleteFamilyMember(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (familyMemberId: string) => FamilyMemberService.deleteFamilyMember(personId, familyMemberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: familyMemberQK.all(personId) });
      toast.success("Anggota keluarga berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus anggota keluarga");
    },
  });
}

export function useFamilyMemberPictureUrl(personId: string, familyMemberId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: familyMemberQK.pictureUrl(personId, familyMemberId),
    queryFn: () => FamilyMemberService.getPictureUrl(personId, familyMemberId),
    enabled: !!personId && !!familyMemberId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
