"use client";

import Image from "next/image";
import { env } from "@/lib/env";

import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useState } from "react";

import { Modal, ModalFormFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Person, FamilyMember } from "@/types/master-data";
import { familyMemberSchema, type FamilyMemberFormValues } from "@/lib/validations/family-member";
import { useCreateFamilyMember, useUpdateFamilyMember } from "@/hooks/api/use-family-member";

export function FamilyMemberFormModal({
  person,
  initial,
  onClose,
}: {
  person: Person;
  initial?: FamilyMember | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<FamilyMemberFormValues>({
    resolver: zodResolver(familyMemberSchema),
    defaultValues: {
      name: initial?.name || "",
      nik_no_kk: initial?.nik_no_kk || "",
      relationship: initial?.relationship || "",
      contact: initial?.contact || "",
      gender: initial?.gender || "",
      picture: undefined,
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createMut = useCreateFamilyMember(person.id);
  const updateMut = useUpdateFamilyMember(person.id, initial?.id || "");
  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: FamilyMemberFormValues) {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("nik_no_kk", values.nik_no_kk);
    formData.append("relationship", values.relationship);
    formData.append("contact", values.contact);
    formData.append("gender", values.gender);
    if (values.picture) {
      formData.append("picture", values.picture);
    }

    if (isEditing) {
      updateMut.mutate(formData, {
        onSuccess: () => onClose(),
      });
    } else {
      createMut.mutate(formData, {
        onSuccess: () => onClose(),
      });
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: ControllerRenderProps<FamilyMemberFormValues, "picture">) => {
    const file = e.target.files?.[0];
    if (file) {
      field.onChange(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      field.onChange(undefined);
      setPreviewUrl(null);
    }
  };

  const removeFile = (field: ControllerRenderProps<FamilyMemberFormValues, "picture">) => {
    field.onChange(undefined);
    setPreviewUrl(null);
    // Note: We don't clear the file input value directly here, but react-hook-form handles it
  };

  return (
    <Modal
      open
      title={
        <div className="flex flex-col">
          <span className="text-xl font-bold">{isEditing ? "Edit Anggota Keluarga" : "Tambah Anggota Keluarga"}</span>
          <span className="text-sm font-normal text-zinc-500">{person.full_name}</span>
        </div>
      }
      onClose={onClose}
      footer={
        <ModalFormFooter
          isPending={isPending}
          isEditing={isEditing}
          onClose={onClose}
          onSubmit={form.handleSubmit(onSubmit)}
          submitLabel="✓ Simpan Anggota Keluarga"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">

          <div className="col-span-2 flex justify-center mb-2">
            <FormField
              control={form.control}
              name="picture"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="cursor-pointer">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 transition flex items-center justify-center group">
                      {previewUrl ? (
                        <>
                          <Image src={previewUrl} alt="Preview" fill unoptimized className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-zinc-400">
                          <Upload size={24} className="mb-1" />
                          <span className="text-[10px]">Pilih Foto</span>
                        </div>
                      )}
                    </div>
                  </FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept={env.acceptedImageTypes.join(", ")}
                      className="hidden"
                      onChange={(e) => handleFileChange(e, field)}
                    />
                  </FormControl>
                  {previewUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-6 text-[10px] text-rose-500 hover:text-rose-600"
                      onClick={() => removeFile(field)}
                    >
                      Hapus Foto
                    </Button>
                  )}
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Nama anggota" {...field} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nik_no_kk"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>NIK / No. KK</FormLabel>
                <FormControl>
                  <Input placeholder="3201xxxxxxxxx" {...field} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relationship"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Hubungan</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih Hubungan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Kepala Keluarga">Kepala Keluarga</SelectItem>
                    <SelectItem value="Suami">Suami</SelectItem>
                    <SelectItem value="Istri">Istri</SelectItem>
                    <SelectItem value="Anak">Anak</SelectItem>
                    <SelectItem value="Orang Tua">Orang Tua</SelectItem>
                    <SelectItem value="Saudara">Saudara</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Kontak</FormLabel>
                <FormControl>
                  <Input placeholder="08xxxxxxxxxx" {...field} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Jenis Kelamin</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Pilih Jenis Kelamin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="laki_laki">Laki-laki</SelectItem>
                    <SelectItem value="perempuan">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
