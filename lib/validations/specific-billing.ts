import { z } from "zod";

export const specificBillingSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  amount: z.number().min(0, "Nominal tidak boleh negatif"),
  is_active: z.boolean(),
});

export type SpecificBillingFormValues = z.infer<typeof specificBillingSchema>;

export const issueSpecificBillingSchema = z.object({
  billing_id: z.string().min(1, "Template iuran wajib dipilih"),
  month: z.number().min(1, "Bulan wajib diisi").max(12),
  year: z.number().min(2000, "Tahun wajib diisi").max(2100),
  unit_ids: z.array(z.string()).min(1, "Pilih minimal 1 unit"),
});

export type IssueSpecificBillingFormValues = z.infer<typeof issueSpecificBillingSchema>;
