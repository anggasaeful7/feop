"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { bulkSecurityScheduleSchema, type BulkSecurityScheduleFormValues } from "@/lib/validations/schedules";
import { useCreateBulkSecuritySchedules } from "@/hooks/api/use-schedules";

export function BulkSecurityScheduleFormModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const form = useForm<BulkSecurityScheduleFormValues>({
    resolver: zodResolver(bulkSecurityScheduleSchema),
    defaultValues: {
      items: [
        {
          officer_name: "",
          shift_name: "",
          scheduled_date: "",
          start_time: "",
          end_time: "",
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const createMut = useCreateBulkSecuritySchedules();
  const isPending = createMut.isPending;

  function onSubmit(values: BulkSecurityScheduleFormValues) {
    createMut.mutate(values, {
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
          <span className="text-2xl font-bold italic">Tambah Massal Jadwal Keamanan</span>
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
            ✓ Simpan Semua
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <div className="max-w-[80vw] max-h-[60vh] overflow-auto border border-zinc-200 rounded-xl relative">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 bg-zinc-100 uppercase sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-3 py-3 w-10 text-center rounded-tl-xl">No</th>
                  <th className="px-3 py-3 min-w-[150px]">Petugas</th>
                  <th className="px-3 py-3 min-w-[120px]">Shift</th>
                  <th className="px-3 py-3 w-[150px]">Tanggal</th>
                  <th className="px-3 py-3 w-[120px]">Mulai</th>
                  <th className="px-3 py-3 w-[120px]">Selesai</th>
                  <th className="px-3 py-3 min-w-[150px]">Catatan</th>
                  <th className="px-3 py-3 w-12 text-center rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {fields.map((field, index) => (
                  <tr key={field.id} className="bg-white hover:bg-zinc-50/50 transition-colors">
                    <td className="px-3 py-2 text-center font-medium text-zinc-400">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.officer_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Nama Petugas..." {...field} className="h-9 bg-white shadow-none" />
                            </FormControl>
                            <FormMessage className="text-[10px] mt-1" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.shift_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Shift (misal: Pagi)..." {...field} className="h-9 bg-white shadow-none" />
                            </FormControl>
                            <FormMessage className="text-[10px] mt-1" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.scheduled_date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="date" {...field} className="h-9 bg-white shadow-none" />
                            </FormControl>
                            <FormMessage className="text-[10px] mt-1" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.start_time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} className="h-9 bg-white shadow-none" />
                            </FormControl>
                            <FormMessage className="text-[10px] mt-1" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.end_time`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input type="time" {...field} className="h-9 bg-white shadow-none" />
                            </FormControl>
                            <FormMessage className="text-[10px] mt-1" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <FormField
                        control={form.control}
                        name={`items.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Catatan..." {...field} className="h-9 bg-white shadow-none text-xs" />
                            </FormControl>
                            <FormMessage className="text-[10px] mt-1" />
                          </FormItem>
                        )}
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              append({
                officer_name: "",
                shift_name: "",
                scheduled_date: "",
                start_time: "",
                end_time: "",
                notes: "",
              })
            }
            className="w-full border-dashed"
          >
            <Plus size={16} className="mr-2" /> Tambah Baris
          </Button>
        </form>
      </Form>
    </Modal>
  );
}
