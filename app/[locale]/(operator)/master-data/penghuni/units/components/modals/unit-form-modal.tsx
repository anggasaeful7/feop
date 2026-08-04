"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker, { registerLocale } from "react-datepicker";
import { id } from "date-fns/locale";
import { Calendar, Loader2 } from "lucide-react";

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

import type { RT, RW, Unit, UnitPayload, UnitType } from "@/types/master-data";
import { unitSchema, type UnitFormValues } from "@/lib/validations/unit";
import { useCreateUnit, useUpdateUnit, useUnit } from "@/hooks/api/use-unit";
import { useUnitTypes } from "@/hooks/api/use-unit-type";
import { usePersonComboboxOptions } from "@/hooks/api/use-person";
import { UNIT_STATUS_LABEL, BILL_PAYER_LABEL } from "@/lib/constants";
import { useRts } from "@/hooks/api/use-rt";
import { useRws } from "@/hooks/api/use-rw";

const EMPTY_DEFAULTS: UnitFormValues = {
  unit_type_id: "",
  code: "",
  block: "",
  floor: null,
  status: "vacant",
  bill_payer: null,
  owner_id: "",
  resident_id: "",
  rw: "",
  rw_id: "",
  rt: "",
  rt_id: "",
  occupancy_month: null,
  occupancy_year: null,
  notes: "",
};

function ensureOption(
  options: { value: string; label: string }[],
  value: string | null | undefined,
  fallbackLabel?: string | null
): { value: string; label: string }[] {
  if (!value || options.some((o) => o.value === value)) return options;
  return [{ value, label: fallbackLabel || value }, ...options];
}

function resolveUnitDefaults(src: Unit, rws: RW[], rtsAll: RT[]): UnitFormValues {
  const rw = src.rw_id
    ? rws.find((r) => r.id === src.rw_id)
    : rws.find((r) => r.code === src.rw);
  const rt = src.rt_id
    ? rtsAll.find((r) => r.id === src.rt_id)
    : rtsAll.find((r) => r.code === src.rt);
  return {
    unit_type_id: src.unit_type_id || "",
    code: src.code || "",
    block: src.block || "",
    floor: src.floor ?? null,
    status: src.status || "vacant",
    bill_payer: src.bill_payer || null,
    owner_id: src.owner_id || "",
    resident_id: src.resident_id || "",
    rw: rw?.code || src.rw || "",
    rw_id: rw?.id || src.rw_id || "",
    rt: rt?.code || src.rt || "",
    rt_id: rt?.id || src.rt_id || "",
    occupancy_month: src.occupancy_month ?? null,
    occupancy_year: src.occupancy_year ?? null,
    notes: src.notes || "",
  };
}

function UnitFormFields({
  title,
  initial,
  onClose,
  unitTypes,
  rws,
  ownerOpts,
  residentOpts,
  defaults,
}: {
  title: string;
  initial?: Unit | null;
  onClose: () => void;
  unitTypes: UnitType[];
  rws: RW[];
  ownerOpts: ReturnType<typeof usePersonComboboxOptions>;
  residentOpts: ReturnType<typeof usePersonComboboxOptions>;
  defaults: UnitFormValues;
}) {
  const isEditing = !!initial;

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: defaults,
  });

  const watched = useWatch({ control: form.control });
  const status = watched.status;
  const ownerId = watched.owner_id;
  const residentId = watched.resident_id;
  const currentMonth = watched.occupancy_month;
  const currentYear = watched.occupancy_year;

  const { data: rtsData } = useRts(
    watched.rw_id ? { rw_id: watched.rw_id, per_page: 500 } : undefined,
    !!watched.rw_id
  );
  const rts = useMemo(() => rtsData?.items || [], [rtsData]);

  useEffect(() => {
    if (!rts.length) return;
    const rt = form.getValues("rt");
    if (rt && !rts.some((r) => r.code === rt)) {
      form.setValue("rt", "");
      form.setValue("rt_id", "");
    }
  }, [rts, form]);

  const ownerIsResident = !!ownerId && ownerId === residentId;

  useEffect(() => {
    if (status === "vacant") {
      form.setValue("bill_payer", null, { shouldValidate: true });
      form.setValue("owner_id", "");
      form.setValue("resident_id", "");
    }
  }, [status, form]);

  const toggleOwnerIsResident = (checked: boolean) => {
    form.setValue("resident_id", checked && ownerId ? ownerId : "", {
      shouldValidate: true,
    });
  };

  const createMut = useCreateUnit();
  const updateMut = useUpdateUnit(initial?.id || "");
  const mutation = isEditing ? updateMut : createMut;
  const isPending = mutation.isPending;

  function onSubmit(values: UnitFormValues) {
    const isVacant = values.status === "vacant";
    const payload: UnitPayload = {
      ...values,
      block: values.block || null,
      floor: values.floor ?? null,
      bill_payer: isVacant ? null : values.bill_payer || null,
      owner_id: isVacant || !values.owner_id ? null : values.owner_id,
      resident_id: isVacant || !values.resident_id ? null : values.resident_id,
      rt: values.rt || null,
      rw: values.rw || null,
      rt_id: values.rt_id || null,
      rw_id: values.rw_id || null,
      occupancy_month: values.occupancy_month ?? null,
      occupancy_year: values.occupancy_year ?? null,
      notes: values.notes || null,
    };
    mutation.mutate(payload, { onSuccess: onClose });
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

          <FormField
            control={form.control}
            name="rw"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>RW</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue("rw_id", rws.find((r) => r.code === val)?.id || "", {
                      shouldValidate: true,
                    });
                  }}
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

          <FormField
            control={form.control}
            name="rt"
            render={({ field }) => (
              <FormItem className="col-span-2 sm:col-span-1">
                <FormLabel>RT</FormLabel>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    form.setValue("rt_id", rts.find((r) => r.code === val)?.id || "", {
                      shouldValidate: true,
                    });
                  }}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl italic bg-transparent border-[#E4DDCB]">
                      <SelectValue placeholder="— pilih RT —" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rts.map((r) => (
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
            render={({ field }) => {
              const ownerOptions = ensureOption(
                ownerOpts.items,
                field.value,
                initial?.owner_name
              );
              return (
                <FormItem className="col-span-2 sm:col-span-1 flex flex-col pt-2 justify-end">
                  <FormLabel>Pemilik</FormLabel>
                  <Combobox
                    options={ownerOptions}
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
              );
            }}
          />

          <FormField
            control={form.control}
            name="resident_id"
            render={({ field }) => {
              const residentOptions = ensureOption(
                residentOpts.items,
                field.value,
                initial?.resident_name
              );
              return (
                <FormItem className="col-span-2 sm:col-span-1 flex flex-col pt-2 justify-end">
                  <FormLabel>Penghuni</FormLabel>
                  <Combobox
                    options={residentOptions}
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
              );
            }}
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
  const { data: rwsData } = useRws({ per_page: 500 });
  const ownerOpts = usePersonComboboxOptions();
  const residentOpts = usePersonComboboxOptions();
  const { data: detail, isFetching } = useUnit(initial?.id || "");

  const src = isEditing ? detail : initial;
  const { data: rtsData } = useRts(
    src?.rw_id ? { rw_id: src.rw_id, per_page: 500 } : undefined,
    !!src?.rw_id
  );

  const unitTypes = unitTypesData?.items || [];
  const rws = useMemo(() => rwsData?.items || [], [rwsData]);
  const rtsAll = useMemo(() => rtsData?.items || [], [rtsData]);

  const defaults = useMemo(() => {
    if (!src) return EMPTY_DEFAULTS;
    if (isEditing && src.rw_id && !rws.length) return undefined;
    if (isEditing && src.rw_id && src.rt_id && !rtsAll.length) return undefined;
    return resolveUnitDefaults(src, rws, rtsAll);
  }, [src, isEditing, rws, rtsAll]);

  const loading = isFetching || defaults === undefined;

  const titleNode = (
    <div className="flex items-center justify-between w-full pr-8">
      <span className="text-2xl font-bold italic">{title}</span>
    </div>
  );

  if (loading) {
    return (
      <Modal
        open
        title={titleNode}
        onClose={onClose}
        footer={
          <ModalFormFooter
            isPending={false}
            onClose={onClose}
            onSubmit={() => {}}
            submitLabel="✓ Simpan Unit"
            submitDisabled
          />
        }
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      </Modal>
    );
  }

  const resolved = defaults ?? EMPTY_DEFAULTS;

  return (
    <UnitFormFields
      key={`${resolved.code}-${resolved.rw}-${resolved.rt}`}
      title={title}
      initial={initial}
      onClose={onClose}
      unitTypes={unitTypes}
      rws={rws}
      ownerOpts={ownerOpts}
      residentOpts={residentOpts}
      defaults={resolved}
    />
  );
}
