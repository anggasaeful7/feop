import * as z from "zod";

export const unitTypeSchema = z.object({
  code: z.string().min(1, { message: "Kode wajib diisi" }),
  name: z.string().min(1, { message: "Nama wajib diisi" }),
  area_sqm: z.number().min(0, { message: "Luas tidak boleh negatif" }),
  unit_count: z.number().int().min(0, { message: "Jumlah unit tidak boleh negatif" }),
  monthly_tariff: z.number().min(0, { message: "Tarif bulanan tidak boleh negatif" }),
  effective_from: z.string().min(1, { message: "Tanggal mulai berlaku wajib diisi" }),
});

export type UnitTypeFormValues = z.infer<typeof unitTypeSchema>;
