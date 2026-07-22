"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Modal, ModalFormFooter } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validations/change-password";
import { useResetResidentUserPassword, useUnit } from "@/hooks/api/use-unit";

export function ResetPasswordModal({
  unitId,
  onClose,
}: {
  unitId: string;
  onClose: () => void;
}) {
  const { data: unit, isLoading, error } = useUnit(unitId);
  const users = useMemo(() => unit?.users || [], [unit?.users]);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetMut = useResetResidentUserPassword();

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: "", confPassword: "" },
  });

  const effectiveUserId = users.length === 1 ? users[0].id : selectedUserId;
  const selectedUser = users.find((u) => u.id === effectiveUserId);

  function onSubmit(values: ChangePasswordFormValues) {
    if (!effectiveUserId) return;
    resetMut.mutate(
      {
        unitId,
        userId: effectiveUserId,
        payload: {
          new_password: values.password,
          password_confirmation: values.confPassword,
        },
      },
      { onSuccess: () => onClose() }
    );
  }

  return (
    <Modal
      open
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-2xl font-bold italic">Reset Password</span>
        </div>
      }
      onClose={onClose}
      footer={
        <ModalFormFooter
          isPending={resetMut.isPending}
          onClose={onClose}
          onSubmit={form.handleSubmit(onSubmit)}
          submitLabel="✓ Reset Password"
          submitDisabled={!effectiveUserId || isLoading}
        />
      }
    >
      <div className="space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat data unit...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            Gagal memuat data unit
          </div>
        )}

        {unit && !isLoading && (
          <>
            <div className="rounded-lg bg-zinc-100 px-3 py-2 text-sm text-zinc-600">
              Unit: <span className="font-bold text-zinc-900">{unit.code}</span>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Pilih User
              </span>
              {users.length === 1 ? (
                <div className="h-10 flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">
                  {users[0].account_type === "owner" ? users[0].owner_name : users[0].resident_name}
                </div>
              ) : users.length === 0 ? (
                <div className="h-10 flex items-center rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-400 italic">
                  Tidak ada user terdaftar
                </div>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="rounded-xl italic bg-transparent">
                    <SelectValue placeholder="— pilih user —" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.account_type === "owner" ? u.owner_name : u.resident_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </label>

            {selectedUser && (
              <div className="rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-600">
                <div>
                  <span className="text-zinc-400">Username: </span>
                  <span className="font-mono text-zinc-800">{selectedUser.username}</span>
                </div>
                {selectedUser.is_default_password && (
                  <div className="mt-1 text-amber-600">Menggunakan password default</div>
                )}
              </div>
            )}

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
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </>
        )}
      </div>
    </Modal>
  );
}
