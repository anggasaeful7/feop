import * as z from "zod";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const familyMemberSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  nik_no_kk: z.string().min(1, "NIK atau No KK harus diisi"),
  relationship: z.string().min(1, "Hubungan harus diisi"),
  contact: z.string().min(1, "Kontak harus diisi"),
  gender: z.string().min(1, "Jenis kelamin harus diisi"),
  picture: z
    .any()
    .optional()
    .refine((file) => {
      if (!file) return true;
      if (file instanceof File) {
        return file.size <= MAX_FILE_SIZE;
      }
      return true;
    }, "Ukuran maksimal file adalah 8MB.")
    .refine((file) => {
      if (!file) return true;
      if (file instanceof File) {
        return ACCEPTED_IMAGE_TYPES.includes(file.type);
      }
      return true;
    }, "Format file harus .jpg, .jpeg, .png, atau .webp."),
});

export type FamilyMemberFormValues = z.infer<typeof familyMemberSchema>;
