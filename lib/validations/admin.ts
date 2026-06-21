import { z } from "zod";

export const masterAdminSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export type MasterAdminFormValues = z.infer<typeof masterAdminSchema>;
