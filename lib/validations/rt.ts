import { z } from "zod";

export const rtSchema = z.object({
  rw_id: z.string().min(1, "RW wajib dipilih"),
  code: z.string().min(1, "Kode RT wajib diisi"),
  name: z.string().min(1, "Nama RT wajib diisi"),
  is_active: z.boolean(),
});

export type RTFormValues = z.infer<typeof rtSchema>;
