"use client";

import { useState } from "react";
import type { RenovationPermit } from "@/types/renovation-permit";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle, XCircle } from "lucide-react";
import { RenovationPermitService } from "@/services/renovation-permit.service";
import { toast } from "sonner";

interface DetailModalProps {
  permit: RenovationPermit;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function DetailModal({ permit, onClose, onApprove, onReject }: DetailModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpeningDoc, setIsOpeningDoc] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300 capitalize">{status}</Badge>;
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 capitalize">{status}</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 border-red-300 capitalize">{status}</Badge>;
      default:
        return <Badge className="capitalize">{status}</Badge>;
    }
  };

  const handleDownloadResult = async () => {
    if (!permit.has_result) return;
    try {
      setIsDownloading(true);
      const res = await RenovationPermitService.getResultUrl(permit.id);
      window.open(res.url, "_blank");
    } catch {
      toast.error("Gagal mengunduh surat izin");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenDocument = async (docId: string) => {
    try {
      setIsOpeningDoc(docId);
      const res = await RenovationPermitService.getDocumentUrl(permit.id, docId);
      window.open(res.url, "_blank");
    } catch {
      toast.error("Gagal membuka dokumen pendukung");
    } finally {
      setIsOpeningDoc(null);
    }
  };

  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Detail Izin Renovasi"
      className="max-w-4xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <div className="space-y-6">
          {/* Informasi Pemohon */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 border-b pb-2 mb-3">Informasi Pemohon</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-500">Nama Pemohon</p>
                <p className="font-medium text-zinc-900">{permit.resident_name}</p>
              </div>
              <div>
                <p className="text-zinc-500">Unit</p>
                <p className="font-medium text-zinc-900">{permit.unit_code}</p>
              </div>
              <div>
                <p className="text-zinc-500">Tanggal Pengajuan</p>
                <p className="font-medium text-zinc-900">{formatDateTime(permit.created_at)}</p>
              </div>
              <div>
                <p className="text-zinc-500">Status</p>
                <div className="mt-1">{getStatusBadge(permit.status)}</div>
              </div>
            </div>
          </div>

          {/* Rincian Renovasi */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 border-b pb-2 mb-3">Rincian Pekerjaan</h4>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-zinc-500 mb-1">Deskripsi Renovasi</p>
                <div className="bg-zinc-50 p-3 rounded border border-zinc-200 text-zinc-700">
                  {permit.description}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-zinc-500">Tingkat Renovasi</p>
                  <p className="font-medium text-zinc-900 capitalize">{permit.renovation_level.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Kendaraan Material</p>
                  <p className="font-medium text-zinc-900">{permit.material_vehicle || "-"}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Tanggal Mulai</p>
                  <p className="font-medium text-zinc-900">{formatDate(permit.start_date)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Estimasi Selesai</p>
                  <p className="font-medium text-zinc-900">{formatDate(permit.estimated_end_date)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Jam Kerja</p>
                  <p className="font-medium text-zinc-900">{permit.work_hours}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Jumlah Pekerja</p>
                  <p className="font-medium text-zinc-900">{permit.worker_count} Orang</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informasi Kontraktor */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 border-b pb-2 mb-3">Informasi Kontraktor</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-500">Penanggung Jawab (PIC)</p>
                <p className="font-medium text-zinc-900">{permit.contractor_pic_name}</p>
              </div>
              <div>
                <p className="text-zinc-500">No. Telepon / HP</p>
                <p className="font-medium text-zinc-900">{permit.contractor_phone}</p>
              </div>
            </div>
          </div>

          {/* Dokumen Pendukung */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-900 border-b pb-2 mb-3">Dokumen Pendukung</h4>
            {permit.documents && permit.documents.length > 0 ? (
              <div className="space-y-2">
                {permit.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg bg-white">
                    <div className="flex items-center gap-3">
                      <FileText className="text-blue-500 h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium text-zinc-900 line-clamp-1">{doc.file_name}</p>
                        <p className="text-xs text-zinc-500">{(doc.file_size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDocument(doc.id)}
                      disabled={isOpeningDoc === doc.id}
                    >
                      {isOpeningDoc === doc.id ? "Memuat..." : "Lihat"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 italic">Tidak ada dokumen pendukung</p>
            )}
          </div>

          {/* Tindak Lanjut Operator */}
          {permit.status === "rejected" && permit.rejection_reason && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="text-sm font-semibold text-red-900 mb-1 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Alasan Penolakan
              </h4>
              <p className="text-sm text-red-700">{permit.rejection_reason}</p>
              <p className="text-xs text-red-600 mt-2">Ditinjau pada: {formatDateTime(permit.reviewed_at || "")}</p>
            </div>
          )}

          {permit.status === "approved" && (
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h4 className="text-sm font-semibold text-emerald-900 mb-1 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Izin Disetujui
              </h4>
              <p className="text-xs text-emerald-700 mb-3">Ditinjau pada: {formatDateTime(permit.reviewed_at || "")}</p>
              {permit.has_result && (
                <Button
                  onClick={handleDownloadResult}
                  disabled={isDownloading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloading ? "Mengunduh..." : "Unduh Surat Izin"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
        {permit.status === "pending" && (onApprove || onReject) && (
          <>
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
          </>
        )}
      </div>
    </Modal>
  );
}
