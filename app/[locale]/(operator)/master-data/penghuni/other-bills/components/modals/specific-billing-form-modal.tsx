"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toggle } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalFormFooter } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  specificBillingSchema,
  type SpecificBillingFormValues,
} from "@/lib/validations/specific-billing";
import {
  useCreateSpecificBilling,
  useUpdateSpecificBilling,
} from "@/hooks/api/use-specific-billing";
import type { SpecificBilling, SpecificBillingPayload } from "@/types/specific-billing";

export function SpecificBillingFormModal({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: SpecificBilling | null;
  onClose: () => void;
}) {
  const create = useCreateSpecificBilling();
  const update = useUpdateSpecificBilling();
  const isPending = create.isPending || update.isPending;

  const form = useForm<SpecificBillingFormValues>({
    resolver: zodResolver(specificBillingSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (initial) {
      form.reset({
        title: initial.title,
        description: initial.description || "",
        amount: initial.amount || 0,
        is_active: initial.is_active,
      });
    }
  }, [initial, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload: SpecificBillingPayload = {
      ...values,
      description: values.description || "",
    };

    if (initial) {
      update.mutate(
        { id: initial.id, payload },
        { onSuccess: onClose }
      );
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  });

  const isEditing = !!initial;

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
          onSubmit={onSubmit}
          submitLabel="✓ Simpan Tagihan"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4 mt-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Judul Tagihan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Tagihan Renovasi" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Nominal (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                    className="rounded-xl italic bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opsional"
                      {...field}
                      className="h-28 py-3 rounded-xl italic resize-none bg-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center space-x-4">
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
          </div>
        </form>
      </Form>
    </Modal>
  );
}
