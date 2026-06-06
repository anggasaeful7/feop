import * as z from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

export const financialReportSchema = z.object({
  kind: z.enum(["monthly", "yearly"]),
  period_month: z.number().nullable().optional(),
  period_year: z.number().min(2000).max(2100),
  title: z.string().max(200).optional().nullable(),
  notes: z.string().optional().nullable(),
  notify_residents: z.boolean(),
  file: z.any()
    .refine((f) => f instanceof File, "File dokumen wajib dipilih.")
    .refine((f) => f instanceof File && f.size <= MAX_FILE_SIZE, "Ukuran file maksimal 10 MB.")
    .refine(
      (f) => f instanceof File && (ACCEPTED_FILE_TYPES.includes(f.type) || /\\.(pdf|xlsx|xls|csv)$/i.test(f.name)),
      "Format file harus PDF, XLSX, XLS, atau CSV."
    ),
}).superRefine((data, ctx) => {
  if (data.kind === "monthly" && !data.period_month) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bulan wajib dipilih untuk laporan bulanan.",
      path: ["period_month"],
    });
  }
});

export type FinancialReportFormValues = z.infer<typeof financialReportSchema>;
