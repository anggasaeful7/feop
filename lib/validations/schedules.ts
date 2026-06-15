import { z } from "zod";

export const baseScheduleSchema = z.object({
  activity: z.string().min(1, "Aktivitas wajib diisi").max(160, "Maksimal 160 karakter"),
  shift_id: z.string().min(1, "Shift wajib dipilih"),
  officer_ids: z.array(z.string()).min(1, "Minimal 1 petugas wajib dipilih"),
  category: z.enum(["daily", "weekly", "once"], { message: "Kategori jadwal wajib dipilih" }),
  scheduled_date: z.string().min(1, "Tanggal wajib diisi"),
  days_off: z.array(z.string()).optional(),
  holiday_dates: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const cleaningScheduleSchema = baseScheduleSchema;
export type CleaningScheduleFormValues = z.infer<typeof cleaningScheduleSchema>;

export const securityScheduleSchema = baseScheduleSchema;
export type SecurityScheduleFormValues = z.infer<typeof securityScheduleSchema>;

export const bulkCleaningScheduleSchema = z.object({
  items: z.array(cleaningScheduleSchema).min(1, "Minimal 1 jadwal wajib ditambahkan").max(100, "Maksimal 100 jadwal sekaligus"),
});

export type BulkCleaningScheduleFormValues = z.infer<typeof bulkCleaningScheduleSchema>;

export const bulkSecurityScheduleSchema = z.object({
  items: z.array(securityScheduleSchema).min(1, "Minimal 1 jadwal wajib ditambahkan").max(100, "Maksimal 100 jadwal sekaligus"),
});

export type BulkSecurityScheduleFormValues = z.infer<typeof bulkSecurityScheduleSchema>;
