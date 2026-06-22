"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { formatDateTime } from "@/lib/format";
import type { Complaint } from "@/types/complaint";
import { useUpdateComplaint, useComplaintPhotoUrl } from "@/hooks/api/use-complaint";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_URGENCY_LABEL,
  COMPLAINT_URGENCY_TONE,
} from "@/lib/constants";

const updateComplaintSchema = z.object({
  status: z.string().min(1, "Status wajib dipilih"),
  response: z.string().optional(),
});

type UpdateComplaintSchema = z.infer<typeof updateComplaintSchema>;

interface DetailModalProps {
  complaint: Complaint;
  onClose: () => void;
}

export function DetailModal({ complaint, onClose }: DetailModalProps) {
  const { data: photoData, isLoading: photoLoading } = useComplaintPhotoUrl(
    complaint.id,
    complaint.has_photo
  );

  const { data: permissions } = usePermissions();
  const canUpdate = hasPermission(permissions, "complaints", "update");

  const { mutate: updateComplaint, isPending } = useUpdateComplaint();

  const form = useForm<UpdateComplaintSchema>({
    resolver: zodResolver(updateComplaintSchema),
    defaultValues: {
      status: complaint.status || "",
      response: complaint.response || "",
    },
  });

  const onSubmit = (data: UpdateComplaintSchema) => {
    updateComplaint(
      { id: complaint.id, payload: data },
      {
        onSuccess: () => {
          toast.success("Laporan masalah berhasil diperbarui");
          onClose();
        },
        onError: () => {
          toast.error("Gagal memperbarui laporan masalah");
        },
      }
    );
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Detail Laporan Masalah"
      className="max-w-4xl max-h-[90vh] flex flex-col"
    >
      <div className="flex-1 overflow-y-auto pr-1">
        <div className="mb-6 text-sm text-zinc-500">
          Rincian dan tindak lanjut laporan masalah dari penghuni
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
          {/* Left Column: Details and Photo */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-zinc-900">Informasi Penghuni</h4>
              <div className="mt-2 text-sm text-zinc-600">
                <p><span className="font-medium text-zinc-900">Nama:</span> {complaint.resident_name}</p>
                <p><span className="font-medium text-zinc-900">Unit:</span> {complaint.unit_code}</p>
                <p><span className="font-medium text-zinc-900">Tanggal:</span> {formatDateTime(complaint.created_at)}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-zinc-900">Rincian Laporan Masalah</h4>
              <div className="mt-2 text-sm text-zinc-600 space-y-2">
                <p><span className="font-medium text-zinc-900">Judul:</span> {complaint.title}</p>
                <p><span className="font-medium text-zinc-900">Kategori:</span> <span className="capitalize">{complaint.category.replace(/_/g, " ")}</span></p>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-zinc-900">Urgensi:</span>
                  <Badge tone={COMPLAINT_URGENCY_TONE[complaint.urgency] || "neutral"} className="capitalize">
                    {COMPLAINT_URGENCY_LABEL[complaint.urgency] || complaint.urgency}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-zinc-900 block mb-1">Deskripsi:</span>
                  <div className="bg-zinc-50 p-3 rounded-md text-zinc-700 whitespace-pre-wrap border border-zinc-200/60">
                    {complaint.description}
                  </div>
                </div>
              </div>
            </div>

            {complaint.has_photo && (
              <div>
                <h4 className="text-sm font-semibold text-zinc-900 mb-2">Foto Lampiran</h4>
                {photoLoading ? (
                  <Skeleton className="h-48 w-full rounded-md" />
                ) : photoData?.url ? (
                  <div className="relative min-h-[200px] max-h-80 w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoData.url}
                      alt="Lampiran Laporan"
                      className="max-h-80 object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-500">
                    Foto tidak tersedia
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Tindak Lanjut & Respon Form */}
          {canUpdate && (
            <div className="rounded-lg border border-zinc-200/60 bg-cream-50/50 p-5 self-start">
              <h4 className="text-sm font-semibold text-zinc-900 mb-4">Tindak Lanjut & Respon</h4>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Update Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="open">{COMPLAINT_STATUS_LABEL.open}</SelectItem>
                            <SelectItem value="in_progress">{COMPLAINT_STATUS_LABEL.in_progress}</SelectItem>
                            <SelectItem value="resolved">{COMPLAINT_STATUS_LABEL.resolved}</SelectItem>
                            <SelectItem value="rejected">{COMPLAINT_STATUS_LABEL.rejected}</SelectItem>
                            <SelectItem value="closed">{COMPLAINT_STATUS_LABEL.closed}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="response"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Respon Operator</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tulis tanggapan atau solusi di sini..."
                            className="resize-none h-32 bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" variant="danger" onClick={onClose} disabled={isPending}>
                      Batal
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Menyimpan..." : "Simpan Pembaruan"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
