"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Card, Button } from "@/components/ui";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

import { financialReportSchema, type FinancialReportFormValues } from "@/lib/validations/financial-report";
import { useCreateFinancialReport } from "@/hooks/api/use-financial-report";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const now = new Date();
const yearOptions = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i);

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function fileBadge(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return { label: "PDF", className: "bg-rose-100 text-rose-700" };
    case "xlsx":
    case "xls":
    case "csv":
      return { label: "XLS", className: "bg-emerald-100 text-emerald-700" };
    case "doc":
    case "docx":
      return { label: "DOC", className: "bg-sky-100 text-sky-700" };
    default:
      return { label: ext?.toUpperCase().slice(0, 4) ?? "FILE", className: "bg-zinc-100 text-zinc-600" };
  }
}

export function ReportForm() {
  const [publishMode, setPublishMode] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const { data: permissions } = usePermissions();
  const canCreate = hasPermission(permissions, "financial_reports", "create");

  const form = useForm<FinancialReportFormValues>({
    resolver: zodResolver(financialReportSchema),
    defaultValues: {
      kind: "monthly",
      period_month: now.getMonth() + 1,
      period_year: now.getFullYear(),
      title: "",
      notes: "",
      notify_residents: true,
      file: undefined,
    },
  });

  const kind = useWatch({ control: form.control, name: "kind" });
  const file = useWatch({ control: form.control, name: "file" });

  const createMut = useCreateFinancialReport();
  const submitting = createMut.isPending;

  function pickFile(f: File | null) {
    if (!f) {
      form.setValue("file", undefined, { shouldValidate: true });
      return;
    }
    form.setValue("file", f, { shouldValidate: true });
  }

  function onSubmit(values: FinancialReportFormValues) {
    const fd = new FormData();
    fd.append("file", values.file);
    fd.append("period_year", String(values.period_year));
    if (values.kind === "monthly" && values.period_month) {
      fd.append("period_month", String(values.period_month));
    }
    fd.append("kind", values.kind);
    if (values.title?.trim()) fd.append("title", values.title.trim());
    if (values.notes?.trim()) fd.append("notes", values.notes.trim());
    fd.append("publish", publishMode ? "true" : "false");
    fd.append("notify_residents", values.notify_residents ? "true" : "false");

    createMut.mutate(fd, {
      onSuccess: () => {
        toast.success(
          publishMode
            ? "Laporan berhasil dipublikasikan ke penghuni."
            : "Laporan tersimpan sebagai draft."
        );
        form.reset({
          kind: "monthly",
          period_month: now.getMonth() + 1,
          period_year: now.getFullYear(),
          title: "",
          notes: "",
          notify_residents: true,
          file: undefined,
        });
        if (fileRef.current) fileRef.current.value = "";
      },
    });
  }

  if (!canCreate) return null;

  return (
    <Card className="lg:col-span-2 space-y-5">
      <h3 className="text-xl font-bold text-zinc-900">Laporan Baru</h3>

      <Form {...form}>
        <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Laporan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl italic bg-transparent">
                        <SelectValue placeholder="— pilih jenis —" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Laporan Bulanan</SelectItem>
                      <SelectItem value="yearly">Laporan Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bulan</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ""}
                    disabled={kind === "yearly"}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl italic bg-transparent">
                        <SelectValue placeholder="— pilih bulan —" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MONTHS_ID.map((m, i) => (
                        <SelectItem key={m} value={String(i + 1)}>
                          {m}
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
              name="period_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl italic bg-transparent">
                        <SelectValue placeholder="— pilih tahun —" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Judul Laporan (Opsional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value || ""}
                    placeholder="mis. Laporan Keuangan April 2026"
                    className="rounded-xl italic bg-transparent"
                    maxLength={200}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file"
            render={() => (
              <FormItem>
                <FormLabel>File Dokumen</FormLabel>
                <FormControl>
                  <div>
                    <div
                      onClick={() => fileRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        pickFile(e.dataTransfer.files?.[0] ?? null);
                      }}
                      role="button"
                      tabIndex={0}
                      className="grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-zinc-300 bg-cream-50 px-6 py-10 text-center hover:border-brand"
                    >
                      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-zinc-500">
                        <UploadCloud size={22} />
                      </div>
                      <div className="font-semibold text-zinc-800">
                        Drop file di sini atau klik untuk upload
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">PDF, XLSX, maks. 10 MB</div>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,.xlsx,.xls,.csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                      className="hidden"
                      onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                    />
                  </div>
                </FormControl>
                <FormMessage />

                {file && (
                  <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3 mt-3">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded text-xs font-bold ${fileBadge(file.name).className}`}
                    >
                      {fileBadge(file.name).label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-semibold text-zinc-900">
                        {file.name}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">{formatBytes(file.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        pickFile(null);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="text-zinc-400 hover:text-zinc-700"
                      aria-label="Hapus"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    value={field.value || ""}
                    placeholder='Highlight untuk penghuni… mis. "Saldo naik 8% karena efisiensi keamanan…"'
                    className="flex min-h-[80px] w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm italic ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notify_residents"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg bg-cream-100 p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5 rounded border-zinc-300 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                  />
                </FormControl>
                <div className="space-y-1 leading-none flex-1">
                  <FormLabel className="text-sm font-semibold text-zinc-900 cursor-pointer">
                    Notifikasi ke penghuni saat publish
                  </FormLabel>
                  <p className="text-xs italic text-zinc-500">
                    Akan dipakai ketika tombol “Publish ke Penghuni” ditekan.
                  </p>
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              variant="secondary"
              onClick={() => setPublishMode(false)}
              disabled={submitting}
            >
              {submitting && !publishMode ? "Mengunggah…" : "Simpan Draft"}
            </Button>
            <Button
              type="submit"
              onClick={() => setPublishMode(true)}
              disabled={submitting}
            >
              {submitting && publishMode ? "Mengunggah…" : "Publish ke Penghuni"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
