"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
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
import DatePicker from "react-datepicker";
import {
  parseLocalDate,
  formatLocalDate,
  parseLocalTime,
  formatLocalTime,
} from "@/lib/utils";

import type { CleaningSchedule } from "@/types/schedules";
import { cleaningScheduleSchema, type CleaningScheduleFormValues } from "@/lib/validations/schedules";
import { useCreateCleaningSchedule, useUpdateCleaningSchedule } from "@/hooks/api/use-schedules";

export function CleaningScheduleFormModal({
  title,
  initial,
  initialDate,
  onClose,
}: {
  title: string;
  initial?: CleaningSchedule | null;
  initialDate?: string;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<CleaningScheduleFormValues>({
    resolver: zodResolver(cleaningScheduleSchema),
    defaultValues: {
      activity: initial?.activity || "",
      worker_name: initial?.worker_name || "",
      category: initial?.category || "once",
      scheduled_date: initial?.scheduled_date || initialDate || "",
      scheduled_time: initial?.scheduled_time ? initial.scheduled_time.slice(0, 5) : "",
      notes: initial?.notes || "",
    },
  });

  const createMut = useCreateCleaningSchedule();
  const updateMut = useUpdateCleaningSchedule(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: CleaningScheduleFormValues) {
    const formattedValues = {
      ...values,
      scheduled_time: values.scheduled_time.slice(0, 5),
    };

    if (isEditing) {
      updateMut.mutate(formattedValues, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      createMut.mutate(formattedValues, {
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
        <>
          <Button variant="danger" onClick={onClose} disabled={isPending}>
            ✕ Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ✓ {isEditing ? "Simpan Perubahan" : "Tambahkan Jadwal"}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Aktivitas</FormLabel>
                <FormControl>
                  <Input placeholder="Pengangkutan sampah" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="worker_name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Nama Petugas</FormLabel>
                <FormControl>
                  <Input placeholder="Asep Setiawan" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Kategori Jadwal</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="once">Sekali (Once)</SelectItem>
                    <SelectItem value="daily">Harian (Daily)</SelectItem>
                    <SelectItem value="weekly">Mingguan (Weekly)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_time"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Waktu</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value ? parseLocalTime(field.value) : null}
                    onChange={(date: Date | null) => field.onChange(date ? formatLocalTime(date) : "")}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Waktu"
                    dateFormat="HH:mm"
                    placeholderText="Pilih waktu"
                    customInput={<Input className="rounded-xl italic bg-transparent w-full" />}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Tanggal</FormLabel>
                <FormControl>
                  <DatePicker
                    selected={field.value ? parseLocalDate(field.value) : null}
                    onChange={(date: Date | null) => field.onChange(date ? formatLocalDate(date) : "")}
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Pilih tanggal"
                    customInput={<Input className="rounded-xl italic bg-transparent w-full" />}
                  />
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
                <FormLabel>Catatan (opsional)</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    value={field.value || ""}
                    className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
