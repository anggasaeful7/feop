"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button, Input, Modal, Toggle } from "@/components/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GeneralFacility } from "@/types";
import {
  generalFacilitySchema,
  GeneralFacilityFormValues,
} from "@/lib/validations/general-facility";
import {
  useCreateGeneralFacility,
  useUpdateGeneralFacility,
} from "@/hooks/api/use-general-facility";

export function GeneralFacilityFormModal({
  initial,
  onClose,
  title,
}: {
  initial?: GeneralFacility | null;
  onClose: () => void;
  title: string;
}) {
  const form = useForm<GeneralFacilityFormValues>({
    resolver: zodResolver(generalFacilitySchema),
    defaultValues: {
      name: initial?.name || "",
      is_active: initial ? initial.is_active : true,
      is_auto_suspend: initial ? initial.is_auto_suspend : false,
    },
  });

  const { setValue } = form;

  const createMutation = useCreateGeneralFacility();
  const updateMutation = useUpdateGeneralFacility();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (initial) {
      setValue("name", initial.name);
      setValue("is_active", initial.is_active);
      setValue("is_auto_suspend", initial.is_auto_suspend);
    }
  }, [initial, setValue]);

  const onSubmit = (data: GeneralFacilityFormValues) => {
    if (initial) {
      updateMutation.mutate(
        { id: initial.id, data },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  return (
    <Modal title={title} onClose={onClose} open={true}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Nama Fasilitas</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Misal: Kolam Renang" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_auto_suspend"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-zinc-200/60 p-3 space-y-0">
                <div className="space-y-0.5 pr-2">
                  <FormLabel>Auto Suspend</FormLabel>
                  <div className="text-xs text-zinc-500">Otomatis nonaktifkan fasilitas jika penghuni menunggak</div>
                </div>
                <FormControl>
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border border-zinc-200/60 p-3 space-y-0">
                <div className="space-y-0.5 pr-2">
                  <FormLabel>Status Aktif</FormLabel>
                  <div className="text-xs text-zinc-500">Tentukan apakah fasilitas ini aktif digunakan</div>
                </div>
                <FormControl>
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
