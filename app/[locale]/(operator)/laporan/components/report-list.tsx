"use client";

import { Download, MoreVertical, Trash2 } from "lucide-react";
import { Card, Badge, Skeleton } from "@/components/ui";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

import type { FinancialReport } from "@/types/financial-report";
import {
  useFinancialReports,
  useDownloadFinancialReport,
  useUpdateFinancialReport,
  useDeleteFinancialReport,
} from "@/hooks/api/use-financial-report";

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

function periodLabel(r: FinancialReport) {
  if (r.kind === "monthly" && r.period_month) {
    return `${MONTHS_ID[r.period_month - 1]} ${r.period_year}`;
  }
  return `Tahunan ${r.period_year}`;
}

function fileBadge(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return { label: "PDF", className: "bg-rose-100 text-rose-700" };
    case "xlsx":
    case "xls":
    case "csv":
      return { label: "XLS", className: "bg-emerald-100 text-emerald-700" };
    case "doc":
    case "docx":
      return { label: "DOC", className: "bg-sky-100 text-sky-700" };
    default:
      return { label: ext?.toUpperCase().slice(0, 4) ?? "FILE", className: "bg-zinc-100 text-zinc-600" };
  }
}

export function ReportList() {
  const { data, isLoading, isError } = useFinancialReports({ per_page: 100 });
  const reports = data?.items;

  const downloadMut = useDownloadFinancialReport();
  const deleteMut = useDeleteFinancialReport();
  const updateMut = useUpdateFinancialReport();

  function downloadReport(r: FinancialReport) {
    downloadMut.mutate(r.id);
  }

  function deleteReport(r: FinancialReport) {
    if (!confirm(`Hapus laporan ${periodLabel(r)} (${r.file_name})?`)) return;
    deleteMut.mutate(r.id);
  }

  function togglePublish(r: FinancialReport) {
    updateMut.mutate({
      id: r.id,
      payload: {
        period_year: r.period_year,
        period_month: r.period_month,
        kind: r.kind,
        title: r.title,
        notes: r.notes,
        publish: r.status !== "published",
        notify_residents: r.notify_residents,
      },
    });
  }

  return (
    <Card>
      <h3 className="text-xl font-bold text-zinc-900">Arsip Laporan</h3>
      <p className="mb-4 text-xs italic text-zinc-500">
        Per workspace · disimpan di Cloudflare R2
      </p>

      {isError && (
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          Gagal memuat arsip laporan.
        </div>
      )}

      <ul className="space-y-3">
        {isLoading && (
          <li className="py-2">
            <Skeleton className="h-16 w-full rounded-lg" />
          </li>
        )}
        {!isLoading && reports?.length === 0 && (
          <li className="py-2 text-sm text-zinc-400">
            Belum ada laporan. Upload pertama Anda di sebelah kiri.
          </li>
        )}
        {!isLoading && reports?.map((r) => {
          const b = fileBadge(r.file_name);
          return (
            <li
              key={r.id}
              className="relative flex items-start gap-3 rounded-lg border border-zinc-200/70 p-3 hover:bg-zinc-50"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded text-xs font-bold ${b.className}`}
              >
                {b.label}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-semibold text-zinc-900">
                    {r.title ?? `Laporan ${periodLabel(r)}`}
                  </div>
                  <Badge tone={r.status === "published" ? "success" : "neutral"}>
                    {r.status === "published" ? "Publish" : "Draft"}
                  </Badge>
                </div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {periodLabel(r)} · {dateFmt.format(new Date(r.created_at))} ·{" "}
                  {formatBytes(r.file_size)}
                </div>
                <div className="mt-0.5 truncate text-xs text-zinc-400">
                  {r.file_name}
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label="Aksi"
                  >
                    <MoreVertical size={16} />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-1 rounded-xl bg-white border border-zinc-200 shadow-lg">
                  <button
                    onClick={() => downloadReport(r)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    <Download size={14} /> Unduh
                  </button>
                  <button
                    onClick={() => togglePublish(r)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    {r.status === "published" ? "Jadikan Draft" : "Publish"}
                  </button>
                  <button
                    onClick={() => deleteReport(r)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> Hapus
                  </button>
                </PopoverContent>
              </Popover>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
