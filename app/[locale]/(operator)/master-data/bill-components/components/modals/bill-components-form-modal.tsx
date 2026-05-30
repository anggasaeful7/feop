"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Toggle } from "@/components/ui";
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
import { Textarea } from "@/components/ui/textarea";

import type { BillComponent } from "@/types/master-data";
import { billComponentSchema, type BillComponentFormValues } from "@/lib/validations/bill-component";
import { useCreateBillComponent, useUpdateBillComponent } from "@/hooks/api/use-bill-component";

export function BillComponentsFormModal({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: BillComponent | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<BillComponentFormValues>({
    resolver: zodResolver(billComponentSchema),
    defaultValues: {
      name: initial?.name || "",
      amount: initial?.amount || null,
      description: initial?.description || "",
      is_variable: initial?.is_variable ?? false,
      is_active: initial?.is_active ?? true,
      sort_order: initial?.sort_order ?? 0,
    },
  });

  const createMut = useCreateBillComponent();
  const updateMut = useUpdateBillComponent(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: BillComponentFormValues) {
    const payload = {
      ...values,
      amount: values.amount === null || values.amount === undefined ? 0 : values.amount,
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
          submitLabel="✓ Simpan Komponen"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Nama Komponen" {...field} className="rounded-xl italic bg-transparent" />
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
                <FormLabel>Harga</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Harga"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : Number(val));
                    }}
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
                      placeholder="Deskripsi"
                      {...field}
                      value={field.value ?? ""}
                      className="h-28 py-3 rounded-xl italic resize-none bg-transparent"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1 flex items-center space-x-4">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border border-zinc-200/70 p-3 flex-1">
                  <FormLabel>
                    Status Aktif
                  </FormLabel>
                  <FormControl>
                    <Toggle checked={field.value} onChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_variable"
              render={({ field }) => (
                <FormItem className="flex-row items-center justify-between space-y-0 rounded-lg border border-zinc-200/70 p-3 flex-1 hidden">
                  <FormLabel>
                    Nilai Variabel
                  </FormLabel>
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
