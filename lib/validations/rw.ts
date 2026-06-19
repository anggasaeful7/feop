import { z } from "zod";

export const rwSchema = z.object({
  code: z.string().min(1, "Kode RW wajib diisi"),
  name: z.string().min(1, "Nama RW wajib diisi"),
  is_active: z.boolean(),
});

export type RWFormValues = z.infer<typeof rwSchema>;
