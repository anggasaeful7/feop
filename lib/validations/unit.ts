import * as z from "zod";

export const unitSchema = z.object({
  unit_type_id: z.string().min(1, { message: "Tipe Unit wajib diisi" }),
  code: z.string().min(1, { message: "Kode wajib diisi" }),
  block: z.string().nullable().optional(),
  floor: z.number().nullable().optional(),
  status: z.enum(["occupied", "vacant", "maintenance"]).optional(),
  bill_payer: z.enum(["owner", "resident"]).nullable().optional(),
  owner_id: z.string().nullable().optional(),
  resident_id: z.string().nullable().optional(),
  rt: z.string().nullable().optional(),
  rw: z.string().nullable().optional(),
  occupancy_month: z.number().nullable().optional(),
  occupancy_year: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  if (data.status !== "vacant") {
    if (!data.bill_payer) {
      ctx.addIssue({
        code: "custom",
        message: "Pembayar Iuran wajib diisi",
        path: ["bill_payer"],
      });
    }
    if (data.bill_payer === "resident" && !data.resident_id) {
      ctx.addIssue({
        code: "custom",
        message: "Penghuni wajib diisi bila bayar iuran = penghuni",
        path: ["resident_id"],
      });
    }
  }
});

export type UnitFormValues = z.infer<typeof unitSchema>;
