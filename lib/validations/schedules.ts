import { z } from "zod";

export const cleaningScheduleSchema = z.object({
  activity: z.string().min(1, "Aktivitas wajib diisi").max(160, "Maksimal 160 karakter"),
  scheduled_date: z.string().min(1, "Tanggal wajib diisi"),
  scheduled_time: z.string().min(1, "Waktu wajib diisi"),
  notes: z.string(),
});

export type CleaningScheduleFormValues = z.infer<typeof cleaningScheduleSchema>;

export const securityScheduleSchema = z.object({
  officer_name: z.string().min(1, "Nama petugas wajib diisi").max(160, "Maksimal 160 karakter"),
  shift_name: z.string().min(1, "Shift wajib diisi").max(100, "Maksimal 100 karakter"),
  scheduled_date: z.string().min(1, "Tanggal wajib diisi"),
  start_time: z.string().min(1, "Waktu mulai wajib diisi"),
  end_time: z.string().min(1, "Waktu selesai wajib diisi"),
  notes: z.string(),
});

export type SecurityScheduleFormValues = z.infer<typeof securityScheduleSchema>;

export const bulkCleaningScheduleSchema = z.object({
  items: z.array(cleaningScheduleSchema).min(1, "Minimal 1 jadwal wajib ditambahkan").max(100, "Maksimal 100 jadwal sekaligus"),
});

export type BulkCleaningScheduleFormValues = z.infer<typeof bulkCleaningScheduleSchema>;

export const bulkSecurityScheduleSchema = z.object({
  items: z.array(securityScheduleSchema).min(1, "Minimal 1 jadwal wajib ditambahkan").max(100, "Maksimal 100 jadwal sekaligus"),
});

export type BulkSecurityScheduleFormValues = z.infer<typeof bulkSecurityScheduleSchema>;
