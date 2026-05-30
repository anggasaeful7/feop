"use client";

import { useState } from "react";
import { Modal, Button } from "@/components/ui";
import type { LetterRequest } from "@/types/letter-request";
import { LetterRequestService } from "@/services/letter-request.service";
import { formatDate } from "@/lib/format";
import { Download, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface DetailModalProps {
  request: LetterRequest;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function DetailModal({ request, onClose, onApprove, onReject }: DetailModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadAttachment = async (attachmentId: string) => {
    try {
      setDownloading(attachmentId);
      const res = await LetterRequestService.getAttachmentUrl(request.id, attachmentId);
      if (res.url) {
        window.open(res.url, "_blank");
      }
    } catch {
      toast.error("Gagal mendapatkan link file");
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadResult = async () => {
    try {
      setDownloading("result");
      const res = await LetterRequestService.getResultUrl(request.id);
      if (res.url) {
        window.open(res.url, "_blank");
      }
    } catch {
      toast.error("Gagal mendapatkan link file hasil");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Modal open title="Detail Pengajuan Surat" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-zinc-500">Tanggal Pengajuan</div>
            <div className="font-medium">{formatDate(request.created_at)}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Status</div>
            <div className="font-medium capitalize">{request.status}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Unit</div>
            <div className="font-medium">{request.unit_code}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Pemohon</div>
            <div className="font-medium">{request.resident_name}</div>
          </div>
        </div>

        <div className="pt-2">
          <div className="text-xs text-zinc-500 mb-1">Subjek Surat</div>
          <div className="font-medium">{request.subject}</div>
        </div>

        {request.reason && (
          <div className="pt-2">
            <div className="text-xs text-zinc-500 mb-1">Keperluan / Keterangan</div>
            <div className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
              {request.reason}
            </div>
          </div>
        )}

        {request.status === "rejected" && request.rejection_reason && (
          <div className="pt-2">
            <div className="text-xs text-rose-500 mb-1">Alasan Penolakan</div>
            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {request.rejection_reason}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-100">
          <div className="text-xs font-semibold text-zinc-600 mb-2">LAMPIRAN PENGHUNI</div>
          {request.attachments?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {request.attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between bg-zinc-50 rounded p-2 text-sm border border-zinc-100">
                  <span className="truncate flex-1 mr-2">{att.file_name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadAttachment(att.id)}
                    disabled={downloading === att.id}
                  >
                    {downloading === att.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-400">Tidak ada lampiran</div>
          )}
        </div>

        {request.has_result && (
          <div className="pt-4 border-t border-zinc-100">
            <div className="text-xs font-semibold text-zinc-600 mb-2">SURAT JADI (HASIL)</div>
            <div className="flex items-center justify-between bg-emerald-50 rounded p-2 text-sm border border-emerald-100">
              <span className="truncate flex-1 mr-2 text-emerald-800">
                {request.result_file_name || "Surat Disetujui"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadResult}
                disabled={downloading === "result"}
                className="text-emerald-700"
              >
                {downloading === "result" ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {request.status === "pending" && (onApprove || onReject) && (
        <div className="mt-6 flex justify-end gap-2 border-t border-zinc-100 pt-4">
          {onReject && (
            <Button variant="danger" onClick={onReject}>
              Tolak
            </Button>
          )}
          {onApprove && (
            <Button onClick={onApprove}>
              Setujui
            </Button>
          )}
        </div>
      )}
    </Modal>
  );
}
