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

import type { Person, PersonPayload } from "@/types/master-data";
import { residentSchema, type ResidentFormValues } from "@/lib/validations/resident";
import { useCreatePerson, useUpdatePerson } from "@/hooks/api/use-person";

export function ResidentFormModal({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: Person | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      full_name: initial?.full_name || "",
      phone: initial?.phone || "",
      email: initial?.email || "",
      id_card_no: initial?.id_card_no || "",
      notes: initial?.notes || "",
    },
  });

  const createMut = useCreatePerson();
  const updateMut = useUpdatePerson(initial?.id || "");
  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: ResidentFormValues) {
    const payload: PersonPayload = {
      full_name: values.full_name,
      phone: values.phone === "" ? null : values.phone,
      email: values.email === "" ? null : values.email,
      id_card_no: values.id_card_no === "" ? null : values.id_card_no,
      notes: values.notes === "" ? null : values.notes,
    };

    if (isEditing) {
      updateMut.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      createMut.mutate(payload, {
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
          submitLabel="✓ Simpan Warga"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Budi Santoso" {...field} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_card_no"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>No. KTP</FormLabel>
                <FormControl>
                  <Input placeholder="3201xxxxxxxxx" {...field} value={field.value || ""} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="+628xxxxxxxxxx" {...field} value={field.value || ""} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="warga@example.com" {...field} value={field.value || ""} className="rounded-xl bg-transparent" />
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
                <FormLabel>Catatan</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    value={field.value || ""}
                    className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
