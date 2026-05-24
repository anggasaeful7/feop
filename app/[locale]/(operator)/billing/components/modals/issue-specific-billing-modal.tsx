"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
} from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  issueSpecificBillingSchema,
  type IssueSpecificBillingFormValues,
} from "@/lib/validations/specific-billing";
import {
  useIssueSpecificBilling,
  useSpecificBillings,
} from "@/hooks/api/use-specific-billing";
import { useUnits } from "@/hooks/api/use-unit";

type Props = {
  onClose: () => void;
};

export function IssueSpecificBillingModal({ onClose }: Props) {
  const issue = useIssueSpecificBilling();
  const { data: billingsData, isLoading: isLoadingBillings } = useSpecificBillings({ per_page: 100 });
  const { data: unitsData, isLoading: isLoadingUnits } = useUnits({ per_page: 1000 }); // fetch up to 1000 units for assignment

  const activeBillings = billingsData?.items.filter((b) => b.is_active) || [];
  const units = unitsData?.items || [];

  const form = useForm<IssueSpecificBillingFormValues>({
    resolver: zodResolver(issueSpecificBillingSchema),
    defaultValues: {
      billing_id: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      unit_ids: [],
    },
  });

  const selectedUnits = useWatch({
    control: form.control,
    name: "unit_ids",
  }) || [];

  const onSubmit = form.handleSubmit((values) => {
    issue.mutate(
      {
        id: values.billing_id,
        payload: {
          month: values.month,
          year: values.year,
          unit_ids: values.unit_ids,
        },
      },
      { onSuccess: onClose }
    );
  });

  const toggleUnit = (id: string) => {
    if (selectedUnits.includes(id)) {
      form.setValue("unit_ids", selectedUnits.filter((u) => u !== id), { shouldValidate: true });
    } else {
      form.setValue("unit_ids", [...selectedUnits, id], { shouldValidate: true });
    }
  };

  const toggleAll = () => {
    if (selectedUnits.length === units.length) {
      form.setValue("unit_ids", [], { shouldValidate: true });
    } else {
      form.setValue("unit_ids", units.map((u) => u.id), { shouldValidate: true });
    }
  };

  return (
    <Modal
      open
      title="Generate Tagihan Spesifik"
      onClose={onClose}
    >
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="billing_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pilih Template Iuran</FormLabel>
                <FormControl>
                  <select
                    className="flex h-9 w-full rounded-md border border-[#E4DDCB] bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="" className="text-zinc-500">-- Pilih Template Iuran --</option>
                    {isLoadingBillings ? (
                      <option disabled>Memuat template...</option>
                    ) : activeBillings.length === 0 ? (
                      <option disabled>Tidak ada template iuran aktif</option>
                    ) : (
                      activeBillings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(b.amount)})
                        </option>
                      ))
                    )}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bulan (1-12)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={12} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun</FormLabel>
                  <FormControl>
                    <Input type="number" min={2000} {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="unit_ids"
            render={() => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Pilih Unit ({selectedUnits.length} terpilih)</FormLabel>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-xs font-medium text-brand-700 hover:underline"
                  >
                    {selectedUnits.length === units.length ? "Batal Pilih Semua" : "Pilih Semua"}
                  </button>
                </div>
                <div className="max-h-[200px] overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                  {isLoadingUnits ? (
                    <div className="p-4 text-center text-sm text-zinc-500">Memuat unit...</div>
                  ) : units.length === 0 ? (
                    <div className="p-4 text-center text-sm text-zinc-500">Tidak ada unit ditemukan</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {units.map((unit) => (
                        <label
                          key={unit.id}
                          className="flex cursor-pointer items-center gap-2 rounded bg-white p-2 border border-zinc-200 hover:bg-zinc-100"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-600"
                            checked={selectedUnits.includes(unit.id)}
                            onChange={() => toggleUnit(unit.id)}
                          />
                          <span className="text-sm font-medium text-zinc-700">{unit.code}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={issue.isPending || selectedUnits.length === 0}>
              Generate
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
