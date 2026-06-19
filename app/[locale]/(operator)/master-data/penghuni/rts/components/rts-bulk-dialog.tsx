"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, Plus } from "lucide-react";

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
import { Toggle, Button } from "@/components/ui";

import type { RW } from "@/types/master-data";
import { rtBulkSchema, type RTBulkFormValues } from "@/lib/validations/rt";
import { useBulkCreateRts } from "@/hooks/api/use-rt";

export function RtsBulkDialog({
  title,
  rws,
  onClose,
}: {
  title: string;
  rws: RW[];
  onClose: () => void;
}) {
  const form = useForm<RTBulkFormValues>({
    resolver: zodResolver(rtBulkSchema),
    defaultValues: {
      rw_id: "",
      items: [{ code: "", name: "", is_active: true }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const bulkCreateMut = useBulkCreateRts();

  function onSubmit(values: RTBulkFormValues) {
    const payload = {
      items: values.items.map((item) => ({
        ...item,
        rw_id: values.rw_id,
      })),
    };

    bulkCreateMut.mutate(payload, {
      onSuccess: () => {
        onClose();
      },
    });
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
      className="max-w-4xl"
      footer={
        <ModalFormFooter
          isPending={bulkCreateMut.isPending}
          onClose={onClose}
          onSubmit={form.handleSubmit(onSubmit)}
          submitLabel="✓ Simpan RT"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Top Level RW Selector */}
          <FormField
            control={form.control}
            name="rw_id"
            render={({ field }) => (
              <FormItem className="max-w-xs">
                <FormLabel>Pilih RW</FormLabel>
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

          <hr className="border-zinc-200" />

          {/* Table Header */}
          <div className="grid grid-cols-[2fr_3fr_1.5fr_auto] gap-4 px-2 font-semibold text-sm text-zinc-700">
            <div>Kode RT</div>
            <div>Nama RT</div>
            <div className="text-center">Status Aktif</div>
            <div className="w-10"></div>
          </div>

          <div className="max-h-[45vh] overflow-y-auto pr-1 space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-[2fr_3fr_1.5fr_auto] gap-4 items-start px-2 py-1 rounded-xl hover:bg-zinc-50 transition"
              >
                {/* Kode RT */}
                <FormField
                  control={form.control}
                  name={`items.${index}.code`}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Contoh: 01"
                          {...inputField}
                          className="rounded-xl italic bg-transparent border-[#E4DDCB]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nama RT */}
                <FormField
                  control={form.control}
                  name={`items.${index}.name`}
                  render={({ field: inputField }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Contoh: RT 01"
                          {...inputField}
                          className="rounded-xl italic bg-transparent border-[#E4DDCB]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Aktif */}
                <FormField
                  control={form.control}
                  name={`items.${index}.is_active`}
                  render={({ field: toggleField }) => (
                    <FormItem className="flex items-center justify-center pt-2">
                      <FormControl>
                        <Toggle
                          checked={toggleField.value}
                          onChange={toggleField.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="pt-1.5 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-[#A83A2E] hover:bg-[#A83A2E]/10 rounded-full"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ code: "", name: "", is_active: true })}
            className="w-full border-dashed rounded-xl border-[#E4DDCB] text-[#4F7A52] hover:bg-[#4F7A52]/10"
          >
            <Plus size={16} className="mr-1" /> Tambah Baris
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
