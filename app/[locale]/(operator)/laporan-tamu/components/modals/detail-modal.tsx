"use client";

import { useState } from "react";
import { Modal, Button, Textarea } from "@/components/ui";
import type { GuestReport } from "@/types/guest-report";
import { GuestReportService } from "@/services/guest-report.service";
import { useUpdateGuestReportNote } from "@/hooks/api/use-guest-report";
import { formatDate } from "@/lib/format";
import { Loader2 } from "lucide-react";
import { FileSection } from "@/components/shared/file-section";
import { toast } from "sonner";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";

export function DetailModal({
  report,
  onClose,
}: {
  report: GuestReport;
  onClose: () => void;
}) {
  const [downloadingKtp, setDownloadingKtp] = useState(false);
  const [operatorNote, setOperatorNote] = useState(report.operator_note || "");
  const [editNote, setEditNote] = useState(report.operator_note || "");

  const updateNoteMutation = useUpdateGuestReportNote();

  const { data: permissions } = usePermissions();
  const canUpdate = hasPermission(permissions, "guest_reports", "update");

  const handleSaveNote = async () => {
    try {
      await updateNoteMutation.mutateAsync({
        id: report.id,
        operator_note: editNote,
      });
      setOperatorNote(editNote);
      toast.success("Catatan operator berhasil disimpan");
      onClose();
    } catch {
      toast.error("Gagal menyimpan catatan operator");
    }
  };

  const handleViewKtp = async () => {
    try {
      setDownloadingKtp(true);
      const res = await GuestReportService.getKtpUrl(report.id);
      if (res.url) {
        window.open(res.url, "_blank");
      }
    } catch {
      toast.error("Gagal mendapatkan link foto KTP");
    } finally {
      setDownloadingKtp(false);
    }
  };

  return (
    <Modal open title="Detail Laporan Tamu" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-500">Tanggal Kunjungan</div>
            <div className="font-medium">{formatDate(report.visit_date)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Durasi</div>
            <div className="font-medium">{report.duration_days} Hari</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Menginap</div>
            <div className="font-medium">{report.is_menginap ? "Ya" : "Tidak"}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Unit</div>
            <div className="font-medium">{report.unit_code}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Penghuni / Pelapor</div>
            <div className="font-medium">{report.resident_name}</div>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-100">
          <div className="text-xs text-zinc-500 mb-1">Nama Tamu</div>
          <div className="font-medium text-lg">{report.guest_name}</div>
        </div>

        {report.notes && (
          <div className="pt-2">
            <div className="text-xs text-zinc-500 mb-1">Keterangan / Catatan</div>
            <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
              {report.notes}
            </div>
          </div>
        )}

        <FileSection
          title="Identitas Tamu (KTP)"
          files={
            report.has_ktp
              ? [{ id: "ktp", name: report.ktp_file_name || "Foto KTP Terlampir" }]
              : []
          }
          emptyMessage="Tidak ada lampiran KTP"
          loadingId={downloadingKtp ? "ktp" : null}
          onView={handleViewKtp}
        />

        {canUpdate && (
          <div className="pt-4 border-t border-zinc-100">
            <div className="text-xs font-semibold text-zinc-600 mb-2">CATATAN OPERATOR</div>
            <div className="space-y-3 mt-1">
              <Textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Tambahkan keterangan atau catatan operator di sini..."
                rows={4}
                className="w-full text-sm bg-white resize-none border border-zinc-200 focus:border-emerald-600 rounded-xl p-3"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="danger" onClick={onClose} disabled={updateNoteMutation.isPending}>
                  Batal
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveNote}
                  disabled={updateNoteMutation.isPending || editNote === operatorNote}
                >
                  {updateNoteMutation.isPending ? (
                    <>
                      <Loader2 size={12} className="animate-spin mr-1" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Catatan"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
