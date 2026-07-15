"use client";

import { useState } from "react";
import type { RenovationPermit } from "@/types/renovation-permit";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { FileSection } from "@/components/shared/file-section";
import { RenovationPermitService } from "@/services/renovation-permit.service";
import { useRenovationPermitDetail } from "@/hooks/api/use-renovation-permit";
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

  const { data: detail, isLoading: isLoadingDetail } = useRenovationPermitDetail(permit.id);
  const permitData = detail ?? permit;

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
    if (!permitData.has_result) return;
    try {
      setIsDownloading(true);
      const res = await RenovationPermitService.getResultUrl(permitData.id);
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
      const res = await RenovationPermitService.getDocumentUrl(permitData.id, docId);
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
      <div className="relative">
        {isLoadingDetail && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        )}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6${isLoadingDetail ? " opacity-50 pointer-events-none" : ""}`}>
          <div className="space-y-6">
            {/* Informasi Pemohon */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-600 mb-3">INFORMASI PEMOHON</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500">Nama Pemohon</p>
                  <p className="font-medium text-zinc-900">{permitData.resident_name}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Unit</p>
                  <p className="font-medium text-zinc-900">{permitData.unit_code}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Tanggal Pengajuan</p>
                  <p className="font-medium text-zinc-900">{formatDateTime(permitData.created_at)}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Status</p>
                  <div className="mt-1">{getStatusBadge(permitData.status)}</div>
                </div>
              </div>
            </div>

            {/* Rincian Renovasi */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-600 mb-3">RINCIAN PEKERJAAN</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-zinc-500 mb-1">Deskripsi Renovasi</p>
                  <div className="bg-zinc-50 p-3 rounded border border-zinc-200 text-zinc-700">
                    {permitData.description}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-zinc-500">Kendaraan Material</p>
                    <p className="font-medium text-zinc-900">{permitData.material_vehicle || "-"}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Tanggal Mulai</p>
                    <p className="font-medium text-zinc-900">{formatDate(permitData.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Estimasi Selesai</p>
                    <p className="font-medium text-zinc-900">{formatDate(permitData.estimated_end_date)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Jam Kerja</p>
                    <p className="font-medium text-zinc-900">{permitData.work_hours}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Jumlah Pekerja</p>
                    <p className="font-medium text-zinc-900">{permitData.worker_count} Orang</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Informasi Kontraktor */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-600 mb-3">INFORMASI KONTRAKTOR</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-zinc-500">Penanggung Jawab (PIC)</p>
                  <p className="font-medium text-zinc-900">{permitData.contractor_pic_name}</p>
                </div>
                <div>
                  <p className="text-zinc-500">No. Telepon / HP</p>
                  <p className="font-medium text-zinc-900">{permitData.contractor_phone}</p>
                </div>
              </div>
            </div>

            {/* File Pendukung */}
            <FileSection
              title="File Pendukung"
              files={permitData.documents?.map((doc) => ({
                id: doc.id,
                name: doc.file_name,
                size: doc.file_size,
              }))}
              emptyMessage="Tidak ada file pendukung"
              loadingId={isOpeningDoc}
              onView={handleOpenDocument}
            />

            {/* Tindak Lanjut Operator */}
            {permitData.status === "rejected" && permitData.rejection_reason && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="text-sm font-semibold text-red-900 mb-1 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Alasan Penolakan
                </h4>
                <p className="text-sm text-red-700">{permitData.rejection_reason}</p>
                <p className="text-xs text-red-600 mt-2">Ditinjau pada: {formatDateTime(permitData.reviewed_at || "")}</p>
              </div>
            )}

            {permitData.status === "approved" && (
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h4 className="text-sm font-semibold text-emerald-900 mb-1 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Izin Disetujui
                </h4>
                <p className="text-xs text-emerald-700 mb-3">Ditinjau pada: {formatDateTime(permitData.reviewed_at || "")}</p>
                {permitData.has_result && (
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
          {permitData.status === "pending" && (onApprove || onReject) && (
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
      </div>
    </Modal>
  );
}
