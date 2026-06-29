"use client";

import { useForm, useWatch } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  parseLocalDate,
  formatLocalDate,
} from "@/lib/format";
import { useOfficers } from "@/hooks/api/use-petugas";
import { useShifts } from "@/hooks/api/use-shift";
import type { BaseSchedule, BaseSchedulePayload } from "@/types/schedules";
import { baseScheduleSchema } from "@/lib/validations/schedules";
import { z } from "zod";

const DAYS_OF_WEEK = [
  { id: "monday", label: "Senin" },
  { id: "tuesday", label: "Selasa" },
  { id: "wednesday", label: "Rabu" },
  { id: "thursday", label: "Kamis" },
  { id: "friday", label: "Jumat" },
  { id: "saturday", label: "Sabtu" },
  { id: "sunday", label: "Minggu" },
];

export function BaseScheduleFormModal({
  title,
  initial,
  initialDate,
  division,
  isPending,
  onSave,
  onClose,
}: {
  title: string;
  initial?: BaseSchedule | null;
  initialDate?: string;
  division: "cleaning" | "security";
  isPending: boolean;
  onSave: (values: BaseSchedulePayload) => void;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const { data: officersData, isLoading: isLoadingOfficers } = useOfficers({ division, per_page: 100 });
  const { data: shiftsData, isLoading: isLoadingShifts } = useShifts({ division, per_page: 100 });

  const officers = officersData?.items || [];
  const shifts = shiftsData?.items || [];

  const form = useForm<z.infer<typeof baseScheduleSchema>>({
    resolver: zodResolver(baseScheduleSchema),
    defaultValues: {
      activity: initial?.activity || "",
      shift_id: initial?.shift_id || "",
      officer_ids: initial?.officer_ids || initial?.officers?.map(o => o.id) || [],
      category: initial?.category || "once",
      scheduled_date: initial?.scheduled_date || initialDate || "",
      days_off: initial?.days_off || [],
      holiday_dates: initial?.holiday_dates || [],
      notes: initial?.notes || "",
    },
  });

  function onSubmit(values: z.infer<typeof baseScheduleSchema>) {
    onSave(values);
  }

  const category = useWatch({
    control: form.control,
    name: "category",
  });

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2 max-h-[70vh] overflow-y-auto pr-2">
          <FormField
            control={form.control}
            name="activity"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Aktivitas</FormLabel>
                <FormControl>
                  <Input placeholder="Aktivitas" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="shift_id"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Shift</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isLoadingShifts}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent">
                      <SelectValue placeholder="Pilih shift" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.time_start.slice(0, 5)} - {s.time_end.slice(0, 5)})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="officer_ids"
            render={() => (
              <FormItem className="col-span-2">
                <FormLabel>Pilih Petugas</FormLabel>
                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border border-zinc-200 p-3 rounded-xl bg-transparent">
                  {isLoadingOfficers ? (
                    <span className="text-sm italic text-zinc-500">Memuat petugas...</span>
                  ) : officers.length === 0 ? (
                    <span className="text-sm italic text-zinc-500">Tidak ada data petugas.</span>
                  ) : (
                    officers.map((officer) => (
                      <FormField
                        key={officer.id}
                        control={form.control}
                        name="officer_ids"
                        render={({ field }) => {
                          return (
                            <FormItem key={officer.id} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(officer.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), officer.id])
                                      : field.onChange(field.value?.filter((value) => value !== officer.id));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">{officer.name}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEditing && (
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
          )}

          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
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

          {!isEditing && category !== "once" && (
            <>
              {category === "daily" && (
                <FormField
                  control={form.control}
                  name="days_off"
                  render={() => (
                    <FormItem className="col-span-2">
                      <FormLabel>Hari Libur (Opsional)</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 border border-zinc-200 rounded-xl bg-transparent">
                        {DAYS_OF_WEEK.map((day) => (
                          <FormField
                            key={day.id}
                            control={form.control}
                            name="days_off"
                            render={({ field }) => {
                              return (
                                <FormItem key={day.id} className="flex flex-row items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(day.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), day.id])
                                          : field.onChange(field.value?.filter((value) => value !== day.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal text-sm cursor-pointer">{day.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="holiday_dates"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Tanggal Libur Ekstra (Opsional)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <DatePicker
                          selected={null}
                          onChange={(date: Date | null) => {
                            if (date) {
                              const formatted = formatLocalDate(date);
                              if (!field.value?.includes(formatted)) {
                                field.onChange([...(field.value || []), formatted]);
                              }
                            }
                          }}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Tambah tanggal libur"
                          customInput={<Input className="rounded-xl italic bg-transparent w-full" />}
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.value?.map((date) => (
                            <div key={date} className="flex items-center gap-1 px-3 py-1 bg-zinc-100 rounded-full text-sm">
                              <span>{date}</span>
                              <button
                                type="button"
                                className="text-zinc-500 hover:text-rose-500"
                                onClick={() => field.onChange(field.value?.filter((d) => d !== date))}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

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
