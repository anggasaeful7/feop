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
import { Toggle } from "@/components/ui";

import type { RW } from "@/types/master-data";
import { rwSchema, type RWFormValues } from "@/lib/validations/rw";
import { useCreateRw, useUpdateRw } from "@/hooks/api/use-rw";

export function RwsFormDialog({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: RW | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<RWFormValues>({
    resolver: zodResolver(rwSchema),
    defaultValues: {
      code: initial?.code || "",
      name: initial?.name || "",
      is_active: initial?.is_active ?? true,
    },
  });

  const createMut = useCreateRw();
  const updateMut = useUpdateRw(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: RWFormValues) {
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
          submitLabel="✓ Simpan RW"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode RW</FormLabel>
                <FormControl>
                  <Input placeholder="02" {...field} className="rounded-xl italic bg-transparent border-[#E4DDCB]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama RW</FormLabel>
                <FormControl>
                  <Input placeholder="RW 02" {...field} className="rounded-xl italic bg-transparent border-[#E4DDCB]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border border-zinc-200/70 p-3 flex-1">
                <FormLabel>Status Aktif</FormLabel>
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
