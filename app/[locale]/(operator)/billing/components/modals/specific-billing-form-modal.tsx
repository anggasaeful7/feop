"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Toggle,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
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

type Props = {
  initial?: SpecificBilling;
  onClose: () => void;
};

export function SpecificBillingFormModal({ initial, onClose }: Props) {
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

  return (
    <Modal
      open
      title={initial ? "Edit Tagihan" : "Tambah Tagihan"}
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Tagihan</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Tagihan Renovasi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi</FormLabel>
                <FormControl>
                  <Textarea placeholder="Opsional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nominal (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-200 p-4">
                <FormLabel className="text-base">Status Aktif</FormLabel>
                <FormControl>
                  <Toggle checked={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              Simpan
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
