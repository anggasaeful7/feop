import { z } from "zod";

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  role: z.string().min(1, "Peran wajib dipilih"),
  hours: z.string().min(1, "Jam operasional wajib dipilih"),
  phone: z.string().min(1, "Nomor telepon wajib diisi"),
  whatsapp: z.string().optional().or(z.literal('')),
  email: z.string().email("Format email tidak valid").optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  is_active: z.boolean(),
  is_emergency: z.boolean(),
  sort_order: z.number().int(),
});

export type EmergencyContactFormValues = z.infer<typeof emergencyContactSchema>;
