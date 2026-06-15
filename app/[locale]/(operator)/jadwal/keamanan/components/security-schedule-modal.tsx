"use client";

import type { SecuritySchedule } from "@/types/schedules";
import { useCreateSecuritySchedule, useUpdateSecuritySchedule } from "@/hooks/api/use-schedules";
import { BaseScheduleFormModal } from "../../components/base-schedule-modal";
import type { BaseSchedulePayload } from "@/types/schedules";

export function SecurityScheduleFormModal({
  title,
  initial,
  initialDate,
  onClose,
}: {
  title: string;
  initial?: SecuritySchedule | null;
  initialDate?: string;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const createMut = useCreateSecuritySchedule();
  const updateMut = useUpdateSecuritySchedule(initial?.id || "");

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
      division="security"
      isPending={isPending}
      onSave={handleSave}
      onClose={onClose}
    />
  );
}
