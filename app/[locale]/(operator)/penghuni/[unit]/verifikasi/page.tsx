"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, X, ArrowLeft, Loader2, FileText, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Button, Card } from "@/components/ui";
import { useUnit } from "@/hooks/api/use-unit";
import { useResidentBills, useResidentBill, useApproveResidentBill, useRejectResidentBill } from "@/hooks/api/use-resident-bill";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
import { idr } from "@/lib/format";
import { toast } from "sonner";

export default function VerifikasiPage({
  params,
  searchParams,
}: {
  params: Promise<{ unit: string }>;
  searchParams: Promise<{ bill_id?: string }>;
}) {
  const { unit } = use(params);
  const searchParamsObj = use(searchParams);
  const bill_id = searchParamsObj?.bill_id;

  const router = useRouter();
  const [rejectNotes, setRejectNotes] = useState("");
  const [isRejectingModal, setIsRejectingModal] = useState(false);

  const { data: permissions } = usePermissions();
  const canApprove = hasPermission(permissions, "resident_bills", "approve");
  const canReject = hasPermission(permissions, "resident_bills", "reject");

  // Load unit detail
  const { data: unitObj, isLoading: unitLoading } = useUnit(unit);

  // Load bills for the specific unit
  const { data: billsData, isLoading: billsLoading } = useResidentBills({
    unit_id: unitObj?.id,
  });

  const { data: detailData, isLoading: detailLoading } = useResidentBill(bill_id || "");

  const pendingBill = useMemo(() => {
    if (bill_id && detailData) return detailData;

    if (!billsData?.items) return null;
    // Find the first bill pending verification, otherwise fallback to any rejected/unpaid bill to view details
    return (
      billsData.items.find((b) => b.status === "pending_verification") ||
      billsData.items.find((b) => b.status === "unpaid" && b.has_proof) ||
      billsData.items[0] ||
      null
    );
  }, [billsData, detailData, bill_id]);

  // Hook mutations
  const approveMutation = useApproveResidentBill();
  const rejectMutation = useRejectResidentBill();

  const handleApprove = async () => {
    if (!pendingBill) return;
    approveMutation.mutate(
      {
        id: pendingBill.id,
        payload: {
          notes: "Bukti transfer diverifikasi dan disetujui oleh Operator",
        },
      },
      {
        onSuccess: () => {
          router.push("/penghuni");
        },
      }
    );
  };

  const handleReject = async () => {
    if (!pendingBill || !rejectNotes.trim()) {
      toast.error("Mohon isi alasan penolakan terlebih dahulu");
      return;
    }
    rejectMutation.mutate(
      {
        id: pendingBill.id,
        reason: rejectNotes.trim(),
      },
      {
        onSuccess: () => {
          setIsRejectingModal(false);
          setRejectNotes("");
          router.push("/penghuni");
        },
      }
    );
  };

  const isLoading = unitLoading || billsLoading || detailLoading;

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-brand" />
        <span className="text-sm text-zinc-500">Memuat detail bukti transfer…</span>
      </div>
    );
  }

  if (!unitObj) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h3 className="text-lg font-bold text-zinc-900">Unit tidak ditemukan</h3>
        <p className="text-sm text-zinc-500 max-w-md">
          Unit &quot;{unit}&quot; tidak dapat ditemukan di workspace ini. Pastikan URL unit sudah benar.
        </p>
        <Link href="/penghuni">
          <Button className="mt-2">
            <ArrowLeft size={16} className="mr-1" /> Kembali ke Billing
          </Button>
        </Link>
      </div>
    );
  }

  if (!pendingBill) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-500 animate-pulse" />
        <h3 className="text-lg font-bold text-zinc-900">Semua Beres!</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          Tidak ada tagihan pending yang memerlukan verifikasi untuk unit <b>{unitObj.code}</b> ({unitObj.resident_name || unitObj.owner_name}).
        </p>
        <Link href="/penghuni">
          <Button className="mt-2">
            <ArrowLeft size={16} className="mr-1" /> Kembali ke Billing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Penghuni · ${unitObj.code} · ${unitObj.resident_name || unitObj.owner_name}`}
        title="Verifikasi Bukti Bayar"
        subtitle="Review klaim pembayaran iuran dari penghuni"
        actions={
          pendingBill.status === "pending_verification" && (canApprove || canReject) ? (
            <div className="flex gap-2">
              {canReject && (
                <Button variant="danger" onClick={() => setIsRejectingModal(true)} disabled={approveMutation.isPending || rejectMutation.isPending}>
                  <X size={16} /> Tolak
                </Button>
              )}
              {canApprove && (
                <Button onClick={handleApprove} disabled={approveMutation.isPending || rejectMutation.isPending}>
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check size={16} /> Setujui & Tandai Lunas
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            <Link href="/penghuni">
              <Button variant="secondary">
                <ArrowLeft size={16} className="mr-1" /> Kembali ke Billing
              </Button>
            </Link>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-zinc-200/70 px-6 py-4 bg-zinc-50/50">
            <h3 className="text-base font-bold text-zinc-900">Bukti Transfer Fisik</h3>
            {pendingBill.proof_file_name ? (
              <div className="text-xs italic text-zinc-500 flex items-center gap-1 font-mono">
                <FileText size={12} /> {pendingBill.proof_file_name}
                {pendingBill.proof_size ? ` · ${(pendingBill.proof_size / 1024).toFixed(1)} KB` : ""}
              </div>
            ) : (
              <span className="text-xs italic text-zinc-400">Bukti file tidak tersedia</span>
            )}
          </div>

          <div className="flex-1 grid place-items-center bg-zinc-900/95 p-8 relative">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative border border-zinc-100 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand" />

              <div className="mx-auto mt-2 grid h-14 w-14 place-items-center rounded-full bg-brand-900 text-xs font-bold text-white shadow-md">
                IPL
              </div>
              <div className="mt-3 text-center text-base font-bold text-zinc-900">
                Laporan Klaim Transfer
              </div>
              <div className="text-center text-xs italic text-zinc-400 mt-0.5">
                Jatuh tempo: {pendingBill.due_at ? new Date(pendingBill.due_at).toLocaleDateString("id-ID") : "—"}
              </div>

              <div className="my-4 border-t border-dashed border-zinc-200" />

              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">Jumlah Tagihan</div>
                <div className="text-2xl font-extrabold text-brand-900 mt-0.5">
                  {idr(pendingBill.total_amount)}
                </div>
              </div>

              <div className="my-4 border-t border-dashed border-zinc-200" />

              <dl className="space-y-2.5 text-xs text-zinc-600">
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-400 font-medium">Judul Tagihan</dt>
                  <dd className="font-semibold text-zinc-800 text-right">{pendingBill.title}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-400 font-medium">Jenis Tagihan</dt>
                  <dd className="font-mono text-zinc-800 uppercase">{pendingBill.kind === "monthly" ? "Bulanan" : "Spesifik"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-400 font-medium">Unit Kode</dt>
                  <dd className="font-mono font-semibold text-zinc-800">{unitObj.code}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-400 font-medium">Status Saat Ini</dt>
                  <dd className="text-right">
                    <Badge
                      tone={
                        pendingBill.status === "paid"
                          ? "success"
                          : pendingBill.status === "pending_verification"
                            ? "warning"
                            : pendingBill.status === "rejected"
                              ? "danger"
                              : "warning"
                      }
                    >
                      {pendingBill.status === "paid"
                        ? "Lunas"
                        : pendingBill.status === "pending_verification"
                          ? "Verifikasi"
                          : pendingBill.status === "rejected"
                            ? "Ditolak"
                            : "Belum"}
                    </Badge>
                  </dd>
                </div>
                {pendingBill.notes && (
                  <div className="flex flex-col gap-1 border-t border-zinc-100 pt-2">
                    <dt className="text-zinc-400 font-medium">Catatan Klaim</dt>
                    <dd className="text-zinc-800 italic bg-zinc-50 p-2 rounded border border-zinc-200/50 leading-relaxed font-sans text-[11px]">
                      &quot;{pendingBill.notes}&quot;
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-4 text-base font-bold text-zinc-900">Detail Klaim Tagihan</h3>
            <dl className="space-y-3.5 text-sm">
              <Row label="Unit / Penghuni" value={`${unitObj.code} · ${unitObj.resident_name || unitObj.owner_name}`} />
              <Row label="Untuk Tagihan" value={pendingBill.title} />
              <Row label="Jumlah Nominal" value={idr(pendingBill.total_amount)} />
              <Row label="Biaya Pokok" value={idr(pendingBill.base_amount)} />
              <Row label="Biaya Platform" value={idr(pendingBill.platform_fee)} />
              <Row label="Dibuat Pada" value={new Date(pendingBill.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })} />
            </dl>
          </Card>

          {pendingBill.status === "pending_verification" && canApprove && (
            <Card className="border-amber-300 bg-amber-50/60">
              <div className="flex gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-200 text-amber-800">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="font-semibold text-amber-800 text-sm">
                    Peringatan Keamanan
                  </div>
                  <div className="mt-1 text-xs text-amber-900/80 leading-relaxed">
                    Pastikan nominal mutasi rekening Anda benar-benar masuk sebesar <b>{idr(pendingBill.total_amount)}</b> sebelum menekan tombol <b>Setujui & Tandai Lunas</b>.
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-base font-bold text-zinc-900">Riwayat Tagihan Unit</h3>
            <ul className="space-y-2 text-sm max-h-[280px] overflow-y-auto pr-3">
              {billsData?.items && billsData.items.length > 1 ? (
                billsData.items
                  .filter((b) => b.id !== pendingBill.id)
                  .map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center justify-between border-b border-zinc-100 py-2.5 last:border-b-0"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-zinc-800 text-xs">{h.title}</span>
                        <span className="text-[10px] text-zinc-400 capitalize">{h.kind === "monthly" ? "Bulanan" : "Spesifik"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-zinc-800">{idr(h.total_amount)}</span>
                        <Badge
                          tone={
                            h.status === "paid"
                              ? "success"
                              : h.status === "rejected"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {h.status === "paid" ? "Lunas" : h.status === "rejected" ? "Ditolak" : "Belum"}
                        </Badge>
                      </div>
                    </li>
                  ))
              ) : (
                <div className="text-xs italic text-zinc-400 py-2">
                  Belum ada riwayat tagihan lain untuk unit ini.
                </div>
              )}
            </ul>
          </Card>
        </div>
      </div>

      {/* Reject Reason Dialog/Modal */}
      {isRejectingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Tolak Bukti Pembayaran</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Silakan masukkan alasan penolakan bukti pembayaran ini agar penghuni dapat membaca alasan tersebut dan mengunggah bukti bayar yang benar.
            </p>

            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="Contoh: Bukti transfer terpotong, atau nominal transfer tidak sesuai..."
              className="w-full h-28 border border-zinc-300 rounded-lg p-3 text-sm focus:border-rose-500 outline-none resize-none mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsRejectingModal(false);
                  setRejectNotes("");
                }}
                disabled={rejectMutation.isPending}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectNotes.trim()}
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Tolak Bukti Transfer"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  label,
  value,
  italic,
}: {
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-zinc-100 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-zinc-500 text-xs">{label}</dt>
      <dd
        className={`text-right text-xs font-semibold text-zinc-900 ${italic ? "italic text-zinc-600" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
