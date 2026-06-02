import * as z from "zod";

export const residentSchema = z.object({
  full_name: z.string().min(1, "Nama lengkap harus diisi"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().or(z.literal("")).nullable(),
  id_card_no: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  family_members: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Nama harus diisi"),
      relationship: z.string().min(1, "Hubungan harus diisi"),
    })
  ),
});

export type ResidentFormValues = z.infer<typeof residentSchema>;
