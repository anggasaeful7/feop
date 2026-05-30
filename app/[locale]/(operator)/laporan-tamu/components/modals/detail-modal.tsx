"use client";

import { useState } from "react";
import { Modal, Button } from "@/components/ui";
import type { GuestReport } from "@/types/guest-report";
import { GuestReportService } from "@/services/guest-report.service";
import { formatDate } from "@/lib/format";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function DetailModal({
  report,
  onClose,
}: {
  report: GuestReport;
  onClose: () => void;
}) {
  const [downloadingKtp, setDownloadingKtp] = useState(false);

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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-500">Tanggal Kunjungan</div>
            <div className="font-medium">{formatDate(report.visit_date)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Durasi</div>
            <div className="font-medium">{report.duration_days} Hari</div>
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

        <div className="pt-4 border-t border-zinc-100">
          <div className="text-xs font-semibold text-zinc-600 mb-2">IDENTITAS TAMU (KTP)</div>
          {report.has_ktp ? (
            <div className="flex items-center justify-between bg-zinc-50 rounded p-2 text-sm border border-zinc-100">
              <span className="truncate flex-1 mr-2 text-zinc-700">
                {report.ktp_file_name || "Foto KTP Terlampir"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewKtp}
                disabled={downloadingKtp}
                className="text-brand-700"
              >
                {downloadingKtp ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
              </Button>
            </div>
          ) : (
            <div className="text-sm text-zinc-400">Tidak ada lampiran KTP</div>
          )}
        </div>
      </div>
    </Modal>
  );
}
