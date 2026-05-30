"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import type { RenovationPermit } from "@/types/renovation-permit";
import { useRejectRenovationPermit } from "@/hooks/api/use-renovation-permit";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const rejectSchema = z.object({
  reason: z.string().min(5, "Alasan penolakan minimal 5 karakter"),
});

type RejectSchema = z.infer<typeof rejectSchema>;

interface RejectModalProps {
  permit: RenovationPermit;
  onClose: () => void;
  onSuccess: () => void;
}

export function RejectModal({ permit, onClose, onSuccess }: RejectModalProps) {
  const { mutate: reject, isPending } = useRejectRenovationPermit();

  const form = useForm<RejectSchema>({
    resolver: zodResolver(rejectSchema),
    defaultValues: {
      reason: "",
    },
  });

  const onSubmit = (data: RejectSchema) => {
    reject(
      { id: permit.id, payload: data },
      {
        onSuccess: () => {
          toast.success("Izin renovasi ditolak");
          onSuccess();
        },
        onError: () => {
          toast.error("Gagal menolak izin renovasi");
        },
      }
    );
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Tolak Izin Renovasi"
      className="max-w-md"
    >
      <div className="mb-4 text-sm text-zinc-500">
        Berikan alasan penolakan izin renovasi untuk <strong>{permit.resident_name}</strong> (Unit: {permit.unit_code}).
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alasan Penolakan</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Contoh: Dokumen tidak lengkap, dll."
                    className="resize-none h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" variant="danger" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Tolak Izin"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
