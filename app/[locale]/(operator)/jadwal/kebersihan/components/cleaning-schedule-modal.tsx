"use client";

import type { CleaningSchedule } from "@/types/schedules";
import { useCreateCleaningSchedule, useUpdateCleaningSchedule } from "@/hooks/api/use-schedules";
import { BaseScheduleFormModal } from "../../components/base-schedule-modal";
import type { BaseSchedulePayload } from "@/types/schedules";

export function CleaningScheduleFormModal({
  title,
  initial,
  initialDate,
  onClose,
}: {
  title: string;
  initial?: CleaningSchedule | null;
  initialDate?: string;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const createMut = useCreateCleaningSchedule();
  const updateMut = useUpdateCleaningSchedule(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function handleSave(values: BaseSchedulePayload) {
    if (isEditing) {
      updateMut.mutate(values, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  }

  return (
    <BaseScheduleFormModal
      title={title}
      initial={initial}
      initialDate={initialDate}
      division="cleaning"
      isPending={isPending}
      onSave={handleSave}
      onClose={onClose}
    />
  );
}
