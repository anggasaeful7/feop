"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { UnitType } from "@/types/master-data";
import { unitTypeSchema, type UnitTypeFormValues } from "@/lib/validations/unit-type";
import { useCreateUnitType, useUpdateUnitType } from "@/hooks/api/use-unit-type";

export function UnitTypeFormModal({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: UnitType | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<UnitTypeFormValues>({
    resolver: zodResolver(unitTypeSchema),
    defaultValues: {
      code: initial?.code || "",
      name: initial?.name || "",
      area_sqm: initial?.area_sqm || 0,
      unit_count: initial?.unit_count || 0,
      monthly_tariff: initial?.monthly_tariff || 0,
      effective_from: initial?.effective_from || new Date().toISOString().slice(0, 10),
    },
  });

  const createMut = useCreateUnitType();
  const updateMut = useUpdateUnitType(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: UnitTypeFormValues) {
    if (isEditing) {
      updateMut.mutate(values, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      createMut.mutate(values, {
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
        <>
          <Button variant="danger" onClick={onClose} disabled={isPending}>
            ✕ Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ✓ {isEditing ? "Simpan Perubahan" : "Tambahkan Tipe Unit"}
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 mt-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Kode</FormLabel>
                <FormControl>
                  <Input placeholder="Tipe 36" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="Tipe 36" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area_sqm"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Luas (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Luas"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : Number(val));
                    }}
                    className="rounded-xl italic bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_count"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Jumlah Unit</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Jumlah Unit"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : Number(val));
                    }}
                    className="rounded-xl italic bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="monthly_tariff"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1 hidden">
                <FormLabel>Tarif Bulanan (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="1000"
                    placeholder="Tarif Bulanan"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={e => {
                      const val = e.target.value;
                      field.onChange(val === "" ? null : Number(val));
                    }}
                    className="rounded-xl italic bg-transparent"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="effective_from"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Berlaku Sejak</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    className="rounded-xl italic bg-transparent"
                  />
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
