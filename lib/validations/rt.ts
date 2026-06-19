import { z } from "zod";

export const rtSchema = z.object({
  rw_id: z.string().min(1, "RW wajib dipilih"),
  code: z.string().min(1, "Kode RT wajib diisi"),
  name: z.string().min(1, "Nama RT wajib diisi"),
  is_active: z.boolean(),
});

export type RTFormValues = z.infer<typeof rtSchema>;

export const rtBulkSchema = z.object({
  rw_id: z.string().min(1, "RW wajib dipilih"),
  items: z.array(
    z.object({
      code: z.string().min(1, "Kode RT wajib diisi"),
      name: z.string().min(1, "Nama RT wajib diisi"),
      is_active: z.boolean(),
    })
  ).min(1, "Minimal 1 RT harus ditambahkan"),
});

export type RTBulkFormValues = z.infer<typeof rtBulkSchema>;
