"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";

import { Modal, ModalFormFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { Person, PersonPayload } from "@/types/master-data";
import { residentSchema, type ResidentFormValues } from "@/lib/validations/resident";
import { useCreatePerson, useUpdatePerson } from "@/hooks/api/use-person";

export function ResidentFormModal({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: Person | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      full_name: initial?.full_name || "",
      phone: initial?.phone || "",
      email: initial?.email || "",
      id_card_no: initial?.id_card_no || "",
      notes: initial?.notes || "",
      family_members: initial?.family_members || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "family_members",
  });

  const createMut = useCreatePerson();
  const updateMut = useUpdatePerson(initial?.id || "");
  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: ResidentFormValues) {
    const payload: PersonPayload = {
      full_name: values.full_name,
      phone: values.phone === "" ? null : values.phone,
      email: values.email === "" ? null : values.email,
      id_card_no: values.id_card_no === "" ? null : values.id_card_no,
      notes: values.notes === "" ? null : values.notes,
      family_members: values.family_members,
    };

    if (isEditing) {
      updateMut.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      createMut.mutate(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  }

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
          onSubmit={form.handleSubmit(onSubmit)}
          submitLabel="✓ Simpan Warga"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                  <Input placeholder="Budi Santoso" {...field} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_card_no"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>No. KTP</FormLabel>
                <FormControl>
                  <Input placeholder="3201xxxxxxxxx" {...field} value={field.value || ""} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Telepon</FormLabel>
                <FormControl>
                  <Input placeholder="+628xxxxxxxxxx" {...field} value={field.value || ""} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="warga@example.com" {...field} value={field.value || ""} className="rounded-xl bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Catatan</FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    value={field.value || ""}
                    className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 border-t border-zinc-100 pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Anggota Keluarga</h4>
                <p className="text-xs text-zinc-500">Daftar anggota keluarga yang tinggal bersama</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs rounded-xl"
                onClick={() => append({ name: "", relationship: "" })}
              >
                <Plus size={14} className="mr-1" /> Tambah Anggota
              </Button>
            </div>

            {fields.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                Belum ada anggota keluarga ditambahkan.
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <FormField
                      control={form.control}
                      name={`family_members.${index}.name`}
                      render={({ field: inputField }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Nama Anggota"
                              className="rounded-xl bg-transparent"
                              {...inputField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`family_members.${index}.relationship`}
                      render={({ field: inputField }) => (
                        <FormItem className="w-1/3">
                          <FormControl>
                            <Input
                              placeholder="Hubungan (cth: Istri, Anak)"
                              className="rounded-xl bg-transparent"
                              {...inputField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl shrink-0"
                      onClick={() => remove(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Form>
    </Modal>
  );
}
