"use client";

import { useForm, useWatch } from "react-hook-form";
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

import type { Unit } from "@/types/master-data";
import { unitSchema, type UnitFormValues } from "@/lib/validations/unit";
import { useCreateUnit, useUpdateUnit } from "@/hooks/api/use-unit";
import { useUnitTypes } from "@/hooks/api/use-unit-type";
import { usePersons } from "@/hooks/api/use-person";

export function UnitFormModal({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: Unit | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const { data: unitTypesData } = useUnitTypes({ per_page: 200 });
  const { data: personsData } = usePersons();

  const unitTypes = unitTypesData?.items || [];
  const persons = personsData?.items || [];

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unit_type_id: initial?.unit_type_id || "",
      code: initial?.code || "",
      block: initial?.block || "",
      floor: initial?.floor ?? null,
      status: initial?.status || "vacant",
      bill_payer: initial?.bill_payer || "resident",
      owner_id: initial?.owner_id || "",
      resident_id: initial?.resident_id || "",
      notes: initial?.notes || "",
    },
  });

  const createMut = useCreateUnit();
  const updateMut = useUpdateUnit(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: UnitFormValues) {
    const payload = {
      ...values,
      block: values.block === "" ? null : values.block,
      owner_id: values.owner_id === "" ? null : values.owner_id,
      resident_id: values.resident_id === "" ? null : values.resident_id,
      notes: values.notes === "" ? null : values.notes,
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

  const ownerId = useWatch({ control: form.control, name: "owner_id" });
  const residentId = useWatch({ control: form.control, name: "resident_id" });
  const ownerIsResident = !!ownerId && ownerId === residentId;

  const toggleOwnerIsResident = (checked: boolean) => {
    if (checked && ownerId) {
      form.setValue("resident_id", ownerId, { shouldValidate: true });
    } else {
      form.setValue("resident_id", "", { shouldValidate: true });
    }
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
        <>
          <Button variant="danger" onClick={onClose} disabled={isPending}>
            ✕ Batal
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            ✓ {isEditing ? "Simpan Perubahan" : "Tambahkan Unit"}
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
                <FormLabel>Kode Unit</FormLabel>
                <FormControl>
                  <Input placeholder="A-12" {...field} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit_type_id"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Tipe Unit</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">— pilih tipe —</option>
                    {unitTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} · {t.area_sqm} m²
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="block"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Blok</FormLabel>
                <FormControl>
                  <Input placeholder="A" {...field} value={field.value || ""} className="rounded-xl italic bg-transparent" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Lantai</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Lantai"
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
            name="owner_id"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Pemilik</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val);
                      if (ownerIsResident) {
                        form.setValue("resident_id", val, { shouldValidate: true });
                      }
                    }}
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">— belum ada —</option>
                    {persons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resident_id"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Penghuni</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    value={field.value || ""}
                    disabled={ownerIsResident}
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">— belum ada —</option>
                    {persons.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              id="ownerIsResident"
              checked={ownerIsResident}
              disabled={!ownerId}
              onChange={(e) => toggleOwnerIsResident(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-brand"
            />
            <label htmlFor="ownerIsResident">Pemilik tinggal sendiri di unit ini (penghuni = pemilik)</label>
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Status Unit</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="occupied">Terhuni</option>
                    <option value="vacant">Kosong</option>
                    <option value="maintenance">Perbaikan</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bill_payer"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Pembayar Iuran</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="resident">Penghuni</option>
                    <option value="owner">Pemilik</option>
                  </select>
                </FormControl>
                <p className="text-xs text-zinc-500 mt-1">Pilih pihak yang menanggung iuran IPL bulanan.</p>
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
                    className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
