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

import type { RT, RW } from "@/types/master-data";
import { rtSchema, type RTFormValues } from "@/lib/validations/rt";
import { useCreateRt, useUpdateRt } from "@/hooks/api/use-rt";

export function RtsFormDialog({
  title,
  initial,
  rws,
  onClose,
}: {
  title: string;
  initial?: RT | null;
  rws: RW[];
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<RTFormValues>({
    resolver: zodResolver(rtSchema),
    defaultValues: {
      rw_id: initial?.rw_id || "",
      code: initial?.code || "",
      name: initial?.name || "",
      is_active: initial?.is_active ?? true,
    },
  });

  const createMut = useCreateRt();
  const updateMut = useUpdateRt(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: RTFormValues) {
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
          submitLabel="✓ Simpan RT"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <FormField
            control={form.control}
            name="rw_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RW</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent border-[#E4DDCB]">
                      <SelectValue placeholder="— pilih RW —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rws.map((rw) => (
                      <SelectItem key={rw.id} value={rw.id}>
                        {rw.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode RT</FormLabel>
                <FormControl>
                  <Input placeholder="01" {...field} className="rounded-xl italic bg-transparent border-[#E4DDCB]" />
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
                <FormLabel>Nama RT</FormLabel>
                <FormControl>
                  <Input placeholder="RT 01" {...field} className="rounded-xl italic bg-transparent border-[#E4DDCB]" />
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
