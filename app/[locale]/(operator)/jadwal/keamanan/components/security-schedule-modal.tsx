"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { SecuritySchedule } from "@/types/schedules";
import { securityScheduleSchema, type SecurityScheduleFormValues } from "@/lib/validations/schedules";
import { useCreateSecuritySchedule, useUpdateSecuritySchedule } from "@/hooks/api/use-schedules";

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

  const form = useForm<SecurityScheduleFormValues>({
    resolver: zodResolver(securityScheduleSchema),
    defaultValues: {
      officer_name: initial?.officer_name || "",
      shift_name: initial?.shift_name || "",
      scheduled_date: initial?.scheduled_date || initialDate || "",
      start_time: initial?.start_time || "",
      end_time: initial?.end_time || "",
      notes: initial?.notes || "",
    },
  });

  const createMut = useCreateSecuritySchedule();
  const updateMut = useUpdateSecuritySchedule(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: SecurityScheduleFormValues) {
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
    <Modal
      open
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-2xl font-bold italic">{title}</span>
        </div>
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" onClick={onClose} disabled={isPending}>
            ✕ Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ✓ {isEditing ? "Simpan Perubahan" : "Tambahkan Jadwal"}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">
          <FormField
            control={form.control}
            name="officer_name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nama Petugas</FormLabel>
                <FormControl>
                  <Input placeholder="Budi Santoso" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shift_name"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Shift</FormLabel>
                <FormControl>
                  <Input placeholder="Shift Pagi" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Tanggal</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Waktu Mulai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Waktu Selesai</FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Catatan (opsional)</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    value={field.value || ""}
                    className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
