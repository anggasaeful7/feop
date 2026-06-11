import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UnitService } from "@/services/unit.service";
import type { AssignBillComponentPayload } from "@/types/master-data";
import { unitQK } from "./use-unit";

export const unitBillComponentsQK = {
  all: ["unit-bill-components"] as const,
  matrix: (id: string) => [...unitBillComponentsQK.all, "matrix", id] as const,
};

export function useUnitBillComponentsMatrix(id: string) {
  return useQuery({
    queryKey: unitBillComponentsQK.matrix(id),
    queryFn: () => UnitService.getUnitBillComponentsMatrix(id),
    enabled: !!id,
  });
}

export function useAssignUnitBillComponents(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignBillComponentPayload) =>
      UnitService.assignUnitBillComponents(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: unitBillComponentsQK.matrix(id) });
      queryClient.invalidateQueries({ queryKey: unitQK.all });
      toast.success("Berhasil mengatur komponen tagihan");
    },
    onError: (err) => {
      toast.error(err.message || "Gagal mengatur komponen tagihan");
    },
  });
}
