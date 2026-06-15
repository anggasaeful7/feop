import { z } from "zod";

export const shiftSchema = z.object({
  name: z.string().min(1, "Nama shift wajib diisi"),
  division: z.enum(["cleaning", "security"], {
    message: "Pilih divisi yang valid",
  }),
  time_start: z.string().min(1, "Jam mulai wajib diisi"),
  time_end: z.string().min(1, "Jam selesai wajib diisi"),
  is_active: z.boolean(),
});

export type ShiftFormValues = z.infer<typeof shiftSchema>;
