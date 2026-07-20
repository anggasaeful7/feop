import { z } from "zod";

export const changePasswordSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((data) => data.password === data.confPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
