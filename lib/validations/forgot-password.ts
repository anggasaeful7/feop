import { z } from "zod";

export const requestOtpSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
});

export type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, "OTP harus 6 digit"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
