"use client";

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button, Input, Label, Modal } from "@/components/ui";
import { PunishmentPayload } from "@/types";
import {
  usePunishments,
  useCreatePunishment,
  useUpdatePunishment,
} from "@/hooks/api/use-punishment";

export function PunishmentSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = usePunishments();
  const punishments = data?.items || [];
  const existing = punishments.length > 0 ? punishments[0] : null;

  const { register, handleSubmit, setValue } = useForm<PunishmentPayload>({
    defaultValues: {
      duration_months: 0,
    },
  });

  const createMutation = useCreatePunishment();
  const updateMutation = useUpdatePunishment();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (existing) {
      setValue("duration_months", existing.duration_months);
    }
  }, [existing, setValue]);

  const onSubmit = (data: PunishmentPayload) => {
    const payload = {
      ...data,
      duration_months: Number(data.duration_months),
    };

    const options = {
      onSuccess: () => {
        onClose();
      },
    };

    if (existing) {
      updateMutation.mutate({ id: existing.id, data: payload }, options);
    } else {
      createMutation.mutate(payload, options);
    }
  };

  return (
    <Modal title="Pengaturan Punishment" onClose={onClose} open={open} className="max-w-md">
      <div className="space-y-4 pt-2">
        <p className="text-sm text-zinc-500">
          Konfigurasi durasi punishment yang berlaku untuk unit yang menunggak di area ini.
        </p>

        {isLoading ? (
          <div className="py-6 text-center text-sm text-zinc-500 animate-pulse">
            Memuat pengaturan...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label>Durasi (Bulan)</Label>
              <Input
                type="number"
                min="0"
                {...register("duration_months", { required: true, valueAsNumber: true })}
                placeholder="Misal: 3"
              />
              <p className="text-xs text-zinc-500 leading-relaxed">
                Contoh: Jika diisi 3, maka unit dengan tagihan tertunggak selama 3 bulan atau lebih akan terkena status punishment (suspensi otomatis fasilitas yang aktif).
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
