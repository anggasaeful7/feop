import * as z from "zod";

export const residentSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap harus diisi"),
  phone: z.string().regex(/^[0-9+]*$/, "Hanya angka dan + diperbolehkan").optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")).nullable(),
  id_card_no: z.string().regex(/^\d*$/, "Hanya angka diperbolehkan").optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ResidentFormValues = z.infer<typeof residentSchema>;
