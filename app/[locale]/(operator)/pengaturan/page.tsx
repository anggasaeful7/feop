"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/page-header";
import { useAuthUser } from "@/hooks/use-auth";
import { UserService } from "@/services/user.service";
import { ApiError } from "@/lib/axios";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validations/change-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

export default function PengaturanPage() {
  const user = useAuthUser();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confPassword: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ChangePasswordFormValues) {
    if (!user?.id) return;
    try {
      await UserService.changePassword(user.id, {
        password: values.password,
        confPassword: values.confPassword,
      });
      toast.success("Password berhasil diubah");
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Gagal mengubah password"
      );
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Akun"
        title="Pengaturan"
        subtitle="Kelola akun dan keamanan Anda"
      />

      <Card className="max-w-lg">
        <h3 className="text-xl font-bold text-zinc-900">Reset Password</h3>
        <p className="mb-6 text-xs italic text-zinc-500">
          Ubah password akun Anda. Minimal 8 karakter.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password baru"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konfirmasi Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Ulangi password baru"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Simpan"
              )}
            </Button>
          </form>
        </Form>
      </Card>
    </>
  );
}
