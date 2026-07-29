"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale";
import { Calendar } from "lucide-react";

registerLocale("id", id);

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
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";

import type { Unit } from "@/types/master-data";
import { unitSchema, type UnitFormValues } from "@/lib/validations/unit";
import { useCreateUnit, useUpdateUnit } from "@/hooks/api/use-unit";
import { useUnitTypes } from "@/hooks/api/use-unit-type";
import { usePersonComboboxOptions } from "@/hooks/api/use-person";
import { useAuthUser } from "@/hooks/use-auth";
import { UNIT_STATUS_LABEL, BILL_PAYER_LABEL } from "@/lib/constants";
import { useMyRts } from "@/hooks/api/use-rt";
import { useRws } from "@/hooks/api/use-rw";

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
  const authUser = useAuthUser();
  const isAdminWorkspace = authUser?.role === "admin_workspace";

  const { data: unitTypesData } = useUnitTypes({ per_page: 200 });
  const { data: rtsData } = useMyRts();
  const { data: rwsData } = useRws({ per_page: 500 });
  const ownerOpts = usePersonComboboxOptions();
  const residentOpts = usePersonComboboxOptions();

  const unitTypes = unitTypesData?.items || [];
  const rws = useMemo(() => rwsData?.items || [], [rwsData?.items]);

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unit_type_id: initial?.unit_type_id || "",
      code: initial?.code || "",
      block: initial?.block || "",
      floor: initial?.floor ?? null,
      status: initial?.status || "vacant",
      bill_payer: initial?.bill_payer || null,
      owner_id: initial?.owner_id || "",
      resident_id: initial?.resident_id || "",
      rt: initial?.rt || "",
      rw: initial?.rw || authUser?.rw || "",
      occupancy_month: initial?.occupancy_month || null,
      occupancy_year: initial?.occupancy_year || null,
      notes: initial?.notes || "",
    },
  });

  const selectedRwCode = useWatch({ control: form.control, name: "rw" });

  const rts = useMemo(() => {
    const data = rtsData || [];
    const selectedRwObj = rws.find((r) => r.code === selectedRwCode);
    const targetRwId = selectedRwObj?.id;

    const seen = new Set<string>();
    const res: typeof data = [];
    data.forEach((r) => {
      const val = typeof r === "string" ? r : r.code;
      if (selectedRwCode && typeof r !== "string" && r.rw_id !== targetRwId) {
        return;
      }
      if (val && !seen.has(val)) {
        seen.add(val);
        res.push(r);
      }
    });
    return res;
  }, [rtsData, selectedRwCode, rws]);

  const createMut = useCreateUnit();
  const updateMut = useUpdateUnit(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: UnitFormValues) {
    const payload = {
      ...values,
      block: values.block === "" ? null : values.block,
      bill_payer: values.status === "vacant" ? null : (values.bill_payer || null),
      owner_id: values.status === "vacant" || values.owner_id === "" ? null : values.owner_id,
      resident_id: values.status === "vacant" || values.resident_id === "" ? null : values.resident_id,
      rt: values.rt === "" ? null : values.rt,
      rw: values.rw === "" ? null : values.rw,
      occupancy_month: values.occupancy_month === null ? null : values.occupancy_month,
      occupancy_year: values.occupancy_year === null ? null : values.occupancy_year,
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

  const status = useWatch({ control: form.control, name: "status" });
  const ownerId = useWatch({ control: form.control, name: "owner_id" });
  const residentId = useWatch({ control: form.control, name: "resident_id" });
  const currentMonth = useWatch({ control: form.control, name: "occupancy_month" });
  const currentYear = useWatch({ control: form.control, name: "occupancy_year" });

  useEffect(() => {
    if (selectedRwCode) {
      const currentRt = form.getValues("rt");
      if (currentRt) {
        const isValid = rts.some((r) => {
          const val = typeof r === "string" ? r : r.code;
          return val === currentRt;
        });
        if (!isValid) {
          form.setValue("rt", "");
        }
      }
    }
  }, [selectedRwCode, rts, form]);
  const ownerIsResident = !!ownerId && ownerId === residentId;

  useEffect(() => {
    if (status === "vacant") {
      form.setValue("bill_payer", null, { shouldValidate: true });
      form.setValue("owner_id", "");
      form.setValue("resident_id", "");
    }
  }, [status, form]);

  useEffect(() => {
    if (!initial && authUser?.rw) {
      form.setValue("rw", authUser.rw);
    }
  }, [authUser, initial, form]);

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
        <ModalFormFooter
          isPending={isPending}
          isEditing={isEditing}
          onClose={onClose}
          onSubmit={form.handleSubmit(onSubmit)}
          submitLabel="✓ Simpan Unit"
        />
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent">
                      <SelectValue placeholder="— pilih tipe —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unitTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.code} · {t.area_sqm} m²
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {isAdminWorkspace ? (
            <FormField
              control={form.control}
              name="rw"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel>RW</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl italic bg-transparent border-[#E4DDCB]">
                        <SelectValue placeholder="— pilih RW —" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rws.map((r) => (
                        <SelectItem key={r.id} value={r.code}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="rw"
              render={({ field }) => (
                <FormItem className="col-span-2 sm:col-span-1">
                  <FormLabel>RW</FormLabel>
                  <FormControl>
                    <Input readOnly placeholder="002" {...field} value={field.value || ""} className="rounded-xl italic bg-zinc-100/50 text-zinc-500 cursor-not-allowed border-[#E4DDCB]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="rt"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>RT</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent border-[#E4DDCB]">
                      <SelectValue placeholder="— pilih RT —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rts.map((r) => {
                      const id = typeof r === "string" ? r : r.id;
                      const val = typeof r === "string" ? r : r.code;
                      const label = typeof r === "string" ? `RT ${r}` : r.name;
                      return (
                        <SelectItem key={id} value={val}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
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
            name="status"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>Status Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent">
                      <SelectValue placeholder="— pilih status —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(UNIT_STATUS_LABEL).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select
                  onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                  value={field.value || "none"}
                  disabled={status === "vacant"}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent">
                      <SelectValue placeholder="— pilih pembayar —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">— pilih pembayar —</SelectItem>
                    {Object.entries(BILL_PAYER_LABEL).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="owner_id"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1 flex flex-col pt-2 justify-end">
                <FormLabel>Pemilik</FormLabel>
                <Combobox
                  options={ownerOpts.items}
                  value={field.value || ""}
                  onSelect={(val) => {
                    field.onChange(val);
                    if (ownerIsResident) {
                      form.setValue("resident_id", val, { shouldValidate: true });
                    }
                  }}
                  placeholder="— pilih pemilik —"
                  searchPlaceholder="Cari pemilik..."
                  disabled={status === "vacant"}
                  className="rounded-xl italic bg-transparent border-[#E4DDCB]"
                  onLoadMore={ownerOpts.loadMore}
                  hasMore={ownerOpts.hasMore}
                  isLoading={ownerOpts.isLoading}
                  onSearchChange={ownerOpts.onSearchChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resident_id"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1 flex flex-col pt-2 justify-end">
                <FormLabel>Penghuni</FormLabel>
                <Combobox
                  options={residentOpts.items}
                  value={field.value || ""}
                  onSelect={(val) => field.onChange(val)}
                  placeholder="— pilih penghuni —"
                  searchPlaceholder="Cari penghuni..."
                  disabled={status === "vacant" || ownerIsResident}
                  className="rounded-xl italic bg-transparent border-[#E4DDCB]"
                  onLoadMore={residentOpts.loadMore}
                  hasMore={residentOpts.hasMore}
                  isLoading={residentOpts.isLoading}
                  onSearchChange={residentOpts.onSearchChange}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2 flex items-center gap-2 text-sm text-zinc-700">
            <Checkbox
              id="ownerIsResident"
              checked={ownerIsResident}
              disabled={status === "vacant" || !ownerId}
              onCheckedChange={(checked) => toggleOwnerIsResident(checked === true)}
            />
            <label
              htmlFor="ownerIsResident"
              className="cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Pemilik tinggal sendiri di unit ini (penghuni = pemilik)
            </label>
          </div>

          <FormField
            control={form.control}
            name="occupancy_month"
            render={() => {
              const dateVal =
                currentMonth && currentYear
                  ? new Date(currentYear, currentMonth - 1, 1)
                  : null;

              return (
                <FormItem className="col-span-2">
                  <FormLabel>Waktu Menempati</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10" />
                      <DatePicker
                        selected={dateVal}
                        onChange={(date: Date | null) => {
                          if (date) {
                            form.setValue("occupancy_month", date.getMonth() + 1, { shouldValidate: true });
                            form.setValue("occupancy_year", date.getFullYear(), { shouldValidate: true });
                          } else {
                            form.setValue("occupancy_month", null, { shouldValidate: true });
                            form.setValue("occupancy_year", null, { shouldValidate: true });
                          }
                        }}
                        dateFormat="MMMM yyyy"
                        showMonthYearPicker
                        locale="id"
                        placeholderText="Pilih waktu menempati..."
                        className="flex h-10 w-full rounded-xl border border-zinc-200 bg-transparent pl-10 pr-3 py-2 text-sm italic ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
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
                    className="flex min-h-20 w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
