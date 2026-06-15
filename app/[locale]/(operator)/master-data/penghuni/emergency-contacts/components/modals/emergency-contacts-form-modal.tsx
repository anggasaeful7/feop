import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, ModalFormFooter } from "@/components/ui/modal";
import { Toggle } from "@/components/ui";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { emergencyContactSchema, type EmergencyContactFormValues } from "@/lib/validations/emergency-contact";
import type { EmergencyContact } from "@/types/emergency-contact";
import {
  useCreateEmergencyContact,
  useUpdateEmergencyContact,
} from "@/hooks/api/use-emergency-contacts";

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

export function EmergencyContactFormModal({
  title,
  initial,
  onClose,
}: {
  title: string;
  initial?: EmergencyContact | null;
  onClose: () => void;
}) {
  const isEditing = !!initial;

  const form = useForm<EmergencyContactFormValues>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: initial?.name || "",
      role: initial?.role || "",
      hours: initial?.hours || "24 Jam",
      phone: initial?.phone || "",
      whatsapp: initial?.whatsapp || "",
      email: initial?.email || "",
      address: initial?.address || "",
      is_active: initial?.is_active ?? true,
      is_emergency: initial?.is_emergency ?? true,
      sort_order: initial?.sort_order ?? 0,
    },
  });

  const createMut = useCreateEmergencyContact();
  const updateMut = useUpdateEmergencyContact(initial?.id || "");

  const isPending = createMut.isPending || updateMut.isPending;

  function onSubmit(values: EmergencyContactFormValues) {
    if (isEditing) {
      updateMut.mutate(values, {
        onSuccess: () => {
          onClose();
        },
      });
    } else {
      createMut.mutate(values, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  }

  return (
    <Modal
      open
      title={
        <div className="flex items-center justify-between w-full pr-8">
          <span className="text-2xl font-bold italic">{title}</span>
        </div>
      }
      onClose={onClose}
      footer={
        <ModalFormFooter
          isPending={isPending}
          isEditing={isEditing}
          onClose={onClose}
          onSubmit={form.handleSubmit(onSubmit)}
          submitLabel="✓ Simpan Kontak"
        />
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border border-zinc-200/70 p-3 flex-1">
                <FormLabel>
                  Status Aktif
                </FormLabel>
                <FormControl>
                  <Toggle checked={field.value} onChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </Modal>
  );
}
