import * as z from "zod";
import { env } from "@/lib/env";

const MAX_FILE_SIZE = env.maxFileSize;
const ACCEPTED_IMAGE_TYPES = env.acceptedImageTypes;

const maxFileSizeMB = MAX_FILE_SIZE / (1024 * 1024);
const formattedExtensions = ACCEPTED_IMAGE_TYPES.map((t) => "." + t.split("/")[1]);
const acceptedExtensionsString =
  formattedExtensions.length > 1
    ? `${formattedExtensions.slice(0, -1).join(", ")}, atau ${formattedExtensions[formattedExtensions.length - 1]}`
    : formattedExtensions[0] || "";

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
    }, `Ukuran maksimal file adalah ${maxFileSizeMB}MB.`)
    .refine((file) => {
      if (!file) return true;
      if (file instanceof File) {
        return ACCEPTED_IMAGE_TYPES.includes(file.type);
      }
      return true;
    }, `Format file harus ${acceptedExtensionsString}.`),
});

export type FamilyMemberFormValues = z.infer<typeof familyMemberSchema>;
