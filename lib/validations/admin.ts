import { z } from "zod";

export const masterAdminSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  password_confirmation: z.string().optional(),
});

export const getAdminSchema = (isEditing: boolean) => z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  full_name: z.string().min(1, "Nama lengkap wajib diisi"),
  password: isEditing
    ? z.string().min(8, "Password minimal 8 karakter").or(z.literal(""))
    : z.string().min(8, "Password minimal 8 karakter"),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok",
  path: ["password_confirmation"],
});

export type MasterAdminFormValues = z.infer<typeof masterAdminSchema>;

export type AdminFormValues = z.infer<ReturnType<typeof getAdminSchema>>;
