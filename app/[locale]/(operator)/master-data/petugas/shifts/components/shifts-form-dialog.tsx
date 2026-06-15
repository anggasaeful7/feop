"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal, ModalFormFooter } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui";

import type { Shift } from "@/types/master-data";
import { shiftSchema, type ShiftFormValues } from "@/lib/validations/shift";
import { useCreateShift, useUpdateShift } from "@/hooks/api/use-shift";

export function ShiftsFormDialog({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: Shift | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: initial?.name || "",
      division: initial?.division || "cleaning",
      time_start: initial?.time_start || "",
      time_end: initial?.time_end || "",
      is_active: initial?.is_active ?? true,
    },
  });

  const createMut = useCreateShift();
  const updateMut = useUpdateShift(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: ShiftFormValues) {
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
        <ModalFormFooter
          isPending={isPending}
          isEditing={isEditing}
          onClose={onClose}
          onSubmit={form.handleSubmit(onSubmit)}
          submitLabel="✓ Simpan Shift"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nama Shift</FormLabel>
                <FormControl>
                  <Input placeholder="Shift Pagi" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="division"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Divisi</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent">
                      <SelectValue placeholder="— pilih divisi —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cleaning">Kebersihan (Cleaning)</SelectItem>
                    <SelectItem value="security">Keamanan (Security)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time_start"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Jam Mulai</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="08:00" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time_end"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Jam Selesai</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="16:00" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="col-span-2 flex flex-row items-center justify-between space-y-0 rounded-lg border border-zinc-200/70 p-3 flex-1 mt-2">
                <FormLabel>
                  Status Aktif
                </FormLabel>
                <FormControl>
                  <Toggle checked={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
