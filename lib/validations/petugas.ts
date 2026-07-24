import { z } from "zod";

export const officerSchema = z.object({
  name: z.string().min(1, "Nama petugas wajib diisi"),
  division: z.enum(["cleaning", "security"], {
    message: "Pilih divisi yang valid",
  }),
  contact: z.string().min(1, "Kontak wajib diisi").regex(/^[0-9+]*$/, "Hanya angka dan + diperbolehkan"),
  email: z.string().min(1, "Email wajib diisi").email("Email tidak valid"),
  is_active: z.boolean(),
});

export type OfficerFormValues = z.infer<typeof officerSchema>;
