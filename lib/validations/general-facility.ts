import * as z from "zod";

export const generalFacilitySchema = z.object({
  name: z.string().min(1, { message: "Nama wajib diisi" }),
  is_active: z.boolean(),
  is_auto_suspend: z.boolean(),
});

export type GeneralFacilityFormValues = z.infer<typeof generalFacilitySchema>;
