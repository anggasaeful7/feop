import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button, Toggle } from "@/components/ui";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { emergencyContactSchema, type EmergencyContactFormValues } from "@/lib/validations/emergency-contact";
import type { EmergencyContact } from "@/types/emergency-contact";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: EmergencyContact | null;
  onSubmit: (data: EmergencyContactFormValues) => void;
  isLoading?: boolean;
}

const ROLE_OPTIONS = [
  "Keamanan",
  "Kesehatan",
  "Pemadam Kebakaran",
  "Pengelola",
  "Layanan Darurat",
  "Lainnya"
];

const HOURS_OPTIONS = [
  "24 Jam",
  "Jam Kerja (08:00 - 17:00)",
  "Bebas"
];

export function ContactModal({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
}: ContactModalProps) {
  const form = useForm<EmergencyContactFormValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: "",
      role: "",
      hours: "24 Jam",
      phone: "",
      whatsapp: "",
      email: "",
      address: "",
      is_active: true,
      is_emergency: true,
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (open && initialData) {
      form.reset({
        name: initialData.name,
        role: initialData.role,
        hours: initialData.hours,
        phone: initialData.phone,
        whatsapp: initialData.whatsapp || "",
        email: initialData.email || "",
        address: initialData.address || "",
        is_active: initialData.is_active,
        is_emergency: initialData.is_emergency,
        sort_order: initialData.sort_order,
      });
    } else if (open && !initialData) {
      form.reset({
        name: "",
        role: "",
        hours: "24 Jam",
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        is_active: true,
        is_emergency: true,
        sort_order: 0,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Modal
      open={open}
      onClose={() => onOpenChange(false)}
      title={initialData ? "Edit Kontak Darurat" : "Tambah Kontak Darurat"}
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Kontak <span className="text-rose-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Masukkan nama kontak" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran <span className="text-rose-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih peran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jam Operasional <span className="text-rose-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jam operasional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {HOURS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Telepon <span className="text-rose-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 08123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: 08123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contoh@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat</FormLabel>
                <FormControl>
                  <Textarea placeholder="Masukkan alamat lengkap (opsional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-zinc-200 p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Status Aktif</FormLabel>
                  <div className="text-sm text-zinc-500">
                    Tentukan apakah kontak ini aktif dan dapat dilihat oleh penghuni
                  </div>
                </div>
                <FormControl>
                  <Toggle
                    checked={field.value}
                    onChange={field.onChange}
                    ariaLabel="Toggle active status"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Kontak"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
