"use client";

import { useState } from "react";
import { Modal, ModalFormFooter } from "@/components/ui/modal";
import { Toggle } from "@/components/ui/toggle";
import { Loader2 } from "lucide-react";
import type { Unit, BillComponentMatrixItem } from "@/types/master-data";
import {
  useUnitBillComponentsMatrix,
  useAssignUnitBillComponents,
} from "@/hooks/api/use-unit-bill-components";

export function AssignComponentsModal({
  unit,
  onClose,
}: {
  unit: Unit;
  onClose: () => void;
}) {
  const { data: matrixRaw, isLoading } = useUnitBillComponentsMatrix(unit.id);
  const assignMut = useAssignUnitBillComponents(unit.id);

  const matrix = matrixRaw?.components || [];

  const [prevId, setPrevId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (matrixRaw && unit.id !== prevId) {
    setPrevId(unit.id);
    setSelected(
      new Set(
        matrix
          .filter((m: BillComponentMatrixItem) => m.assigned)
          .map((m: BillComponentMatrixItem) => m.id)
      )
    );
  }

  function handleToggle(id: string, checked: boolean) {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  }

  function onSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    assignMut.mutate(
      { component_ids: Array.from(selected) },
      { onSuccess: onClose }
    );
  }

  return (
    <Modal
      open
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-2xl font-bold italic">Atur Komponen: {unit.code}</span>
        </div>
      }
      onClose={onClose}
      footer={
        <ModalFormFooter
          isPending={assignMut.isPending}
          isEditing={true}
          onClose={onClose}
          onSubmit={onSubmit}
          submitLabel="✓ Simpan Pengaturan"
        />
      }
    >
      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <p className="text-sm text-zinc-600 mb-4">
          Pilih komponen tagihan aktif yang akan dikenakan ke unit <strong>{unit.code}</strong>.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
          </div>
        ) : !matrix || matrix.length === 0 ? (
          <div className="text-center py-8 text-sm text-zinc-500">
            Tidak ada komponen tagihan yang tersedia.
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {matrix.map((item) => {
              const isChecked = selected.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50"
                >
                  <div>
                    <div className="font-semibold text-zinc-900">{item.name}</div>
                    <div className="text-sm text-zinc-500">
                      Rp {item.amount.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <Toggle
                    checked={isChecked}
                    onChange={(val) => handleToggle(item.id, val)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </form>
    </Modal>
  );
}
