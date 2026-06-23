"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

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

import { getAdminSchema, type AdminFormValues } from "@/lib/validations/admin";
import type { MasterAdminPayload } from "@/types/master-data";

export function MasterAdminFormDialog({
  title,
  onClose,
  onSubmit,
  isPending,
  initial,
  isEditing = false,
}: {
  title: string;
  onClose: () => void;
  onSubmit: (values: MasterAdminPayload) => void;
  isPending: boolean;
  initial?: { email: string; full_name: string };
  isEditing?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const schema = getAdminSchema(isEditing);

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initial?.email || "",
      full_name: initial?.full_name || "",
      password: "",
      password_confirmation: "",
    },
  });

  const handleFormSubmit = (data: AdminFormValues) => {
    const submitData: MasterAdminPayload = {
      email: data.email,
      full_name: data.full_name,
      ...(data.password ? { password: data.password } : {}),
      ...(data.password_confirmation ? { password_confirmation: data.password_confirmation } : {}),
    };
    onSubmit(submitData);
  };

  return (
    <Modal
      open
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-2xl font-bold italic">{title}</span>
        </div>
      }
      onClose={onClose}
      footer={
        <ModalFormFooter
          isPending={isPending}
          isEditing={isEditing}
          onClose={onClose}
          onSubmit={form.handleSubmit(handleFormSubmit)}
          submitLabel={isEditing ? "✓ Simpan Perubahan" : "✓ Simpan Admin"}
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 mt-2">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="rounded-xl italic bg-transparent border-[#E4DDCB]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="admin@example.com" {...field} className="rounded-xl italic bg-transparent border-[#E4DDCB]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      className="rounded-xl italic bg-transparent border-[#E4DDCB] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-3 flex items-center px-2 text-zinc-400 hover:text-zinc-600"
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
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      className="rounded-xl italic bg-transparent border-[#E4DDCB] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute inset-y-0 right-3 flex items-center px-2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
