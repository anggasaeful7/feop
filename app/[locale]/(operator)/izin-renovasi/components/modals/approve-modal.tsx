"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useState } from "react";

import type { RenovationPermit } from "@/types/renovation-permit";
import { useApproveRenovationPermit } from "@/hooks/api/use-renovation-permit";
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
import { Input } from "@/components/ui/input";

const approveSchema = z.object({
  file: z.instanceof(File, { message: "File surat izin wajib diunggah" }),
});

type ApproveSchema = z.infer<typeof approveSchema>;

interface ApproveModalProps {
  permit: RenovationPermit;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveModal({ permit, onClose, onSuccess }: ApproveModalProps) {
  const { mutate: approve, isPending } = useApproveRenovationPermit();
  const [fileError, setFileError] = useState("");

  const form = useForm<ApproveSchema>({
    resolver: zodResolver(approveSchema),
  });

  const onSubmit = (data: ApproveSchema) => {
    approve(
      { id: permit.id, file: data.file },
      {
        onSuccess: () => {
          toast.success("Izin renovasi berhasil disetujui");
          onSuccess();
        },
        onError: () => {
          toast.error("Gagal menyetujui izin renovasi");
        },
      }
    );
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Setujui Izin Renovasi"
      className="max-w-md"
    >
      <div className="mb-4 text-sm text-zinc-500">
        Unggah dokumen persetujuan izin renovasi resmi yang sudah ditandatangani untuk <strong>{permit.resident_name}</strong> (Unit: {permit.unit_code}).
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="file"
            render={({ field: { value: _, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Surat Izin (PDF)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setFileError("Ukuran file maksimal 5MB");
                        } else {
                          setFileError("");
                          onChange(file);
                        }
                      }
                    }}
                    {...field}
                  />
                </FormControl>
                {fileError && <p className="text-[0.8rem] font-medium text-destructive">{fileError}</p>}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending || !!fileError}>
              {isPending ? "Menyimpan..." : "Setujui Izin"}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
}
