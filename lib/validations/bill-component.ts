import * as z from "zod";

export const billComponentSchema = z.object({
  name: z.string().min(1, "Nama komponen wajib diisi"),
  description: z.string().optional().nullable(),
  amount: z.number().min(0, "Amount tidak boleh negatif").optional().nullable(),
  is_variable: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number(),
});

export type BillComponentFormValues = z.infer<typeof billComponentSchema>;
