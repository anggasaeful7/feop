"use client";

import { useEffect, useRef, useState } from "react";
import { Download, MoreVertical, Trash2, UploadCloud, X } from "lucide-react";
import { ApiError, API_URL, authHeaders, api } from "@/lib/axios";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Button, Card } from "@/components/ui";

type ReportKind = "monthly" | "yearly";
type ReportStatus = "draft" | "published";

type FinancialReport = {
  id: string;
  workspace_id: string;
  period_year: number;
  period_month?: number | null;
  kind: ReportKind;
  status: ReportStatus;
  title?: string | null;
  notes?: string | null;
  file_name: string;
  file_size: number;
  mime_type: string;
  notify_residents: boolean;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
};

type Paged<T> = { items: T[]; total: number; page: number; per_page: number };

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

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

const now = new Date();

export default function LaporanPage() {
  const [periodYear, setPeriodYear] = useState<number>(now.getFullYear());
  const [periodMonth, setPeriodMonth] = useState<number>(now.getMonth() + 1);
  const [kind, setKind] = useState<ReportKind>("monthly");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [notify, setNotify] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [reports, setReports] = useState<FinancialReport[] | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const out = await api<Paged<FinancialReport>>(
          "/api/v1/reports/financial?per_page=100",
        );
        if (!cancelled) {
          setReports(out.items);
          setListError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setListError(e instanceof ApiError ? e.message : "Gagal memuat arsip");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  function pickFile(f: File | null) {
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setSubmitError("Ukuran file melebihi 10 MB.");
      return;
    }
    if (f.type && !ACCEPTED.includes(f.type)) {
      // allow by extension fallback (some browsers don't set Content-Type for xlsx)
      const ok = /\.(pdf|xlsx|xls|csv)$/i.test(f.name);
      if (!ok) {
        setSubmitError("Format harus PDF atau XLSX.");
        return;
      }
    }
    setSubmitError(null);
    setFile(f);
  }

  async function submit(publish: boolean) {
    setSubmitError(null);
    setSubmitSuccess(null);
    if (!file) {
      setSubmitError("Pilih file dulu.");
      return;
    }
    if (kind === "monthly" && (!periodMonth || periodMonth < 1 || periodMonth > 12)) {
      setSubmitError("Bulan wajib dipilih untuk laporan bulanan.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("period_year", String(periodYear));
      if (kind === "monthly") fd.append("period_month", String(periodMonth));
      fd.append("kind", kind);
      if (title.trim()) fd.append("title", title.trim());
      if (notes.trim()) fd.append("notes", notes.trim());
      fd.append("publish", publish ? "true" : "false");
      fd.append("notify_residents", notify ? "true" : "false");

      const res = await fetch(`${API_URL}/api/v1/reports/financial`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
        body: fd,
      });
      const body = (await res.json().catch(() => null)) as
        | { data: FinancialReport }
        | { error: { message: string } }
        | null;
      if (!res.ok) {
        const msg =
          body && "error" in body ? body.error.message : `Upload gagal (${res.status})`;
        throw new Error(msg);
      }
      setSubmitSuccess(
        publish
          ? "Laporan berhasil dipublikasikan ke penghuni."
          : "Laporan tersimpan sebagai draft.",
      );
      setFile(null);
      setTitle("");
      setNotes("");
      if (fileRef.current) fileRef.current.value = "";
      setReload((n) => n + 1);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Gagal upload");
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadReport(r: FinancialReport) {
    try {
      const out = await api<{ url: string; file_name: string }>(
        `/api/v1/reports/financial/${r.id}/download-url`,
      );
      window.open(out.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      setListError(e instanceof ApiError ? e.message : "Gagal membuat link unduh");
    }
  }

  async function deleteReport(r: FinancialReport) {
    if (!confirm(`Hapus laporan ${periodLabel(r)} (${r.file_name})?`)) return;
    try {
      await api(`/api/v1/reports/financial/${r.id}`, { method: "DELETE" });
      setReload((n) => n + 1);
    } catch (e) {
      setListError(e instanceof ApiError ? e.message : "Gagal menghapus");
    }
  }

  async function togglePublish(r: FinancialReport) {
    try {
      await api<FinancialReport>(`/api/v1/reports/financial/${r.id}`, {
        method: "PUT",
        body: JSON.stringify({
          period_year: r.period_year,
          period_month: r.period_month,
          kind: r.kind,
          title: r.title,
          notes: r.notes,
          publish: r.status !== "published",
          notify_residents: r.notify_residents,
        }),
      });
      setReload((n) => n + 1);
    } catch (e) {
      setListError(e instanceof ApiError ? e.message : "Gagal mengubah status");
    }
  }

  const yearOptions = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i);

  return (
    <>
      <PageHeader
        eyebrow="Admin · Transparansi kas"
        title="Upload Laporan Keuangan"
        subtitle="Upload laporan bulanan/tahunan agar penghuni bisa lihat"
      />

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 space-y-5">
          <h3 className="text-xl font-bold text-zinc-900">Laporan Baru</h3>

          <div className="grid grid-cols-3 gap-4">
            <Field label="JENIS">
              <select
                className={inputClass}
                value={kind}
                onChange={(e) => setKind(e.target.value as ReportKind)}
              >
                <option value="monthly">Laporan Bulanan</option>
                <option value="yearly">Laporan Tahunan</option>
              </select>
            </Field>
            <Field label="BULAN">
              <select
                className={inputClass}
                value={periodMonth}
                onChange={(e) => setPeriodMonth(Number(e.target.value))}
                disabled={kind === "yearly"}
              >
                {MONTHS_ID.map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="TAHUN">
              <select
                className={inputClass}
                value={periodYear}
                onChange={(e) => setPeriodYear(Number(e.target.value))}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="JUDUL (OPSIONAL)">
            <input
              type="text"
              className={inputClass}
              placeholder="mis. Laporan Keuangan April 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </Field>

          <Field label="FILE DOKUMEN">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickFile(e.dataTransfer.files?.[0] ?? null);
              }}
              role="button"
              tabIndex={0}
              className="grid cursor-pointer place-items-center rounded-xl border-2 border-dashed border-zinc-300 bg-cream-50 px-6 py-10 text-center hover:border-brand"
            >
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-white text-zinc-500">
                <UploadCloud size={22} />
              </div>
              <div className="font-semibold text-zinc-800">
                Drop file di sini atau klik untuk upload
              </div>
              <div className="mt-1 text-xs text-zinc-500">PDF, XLSX, maks. 10 MB</div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </Field>

          {file && (
            <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3">
              <span
                className={`grid h-9 w-9 place-items-center rounded text-xs font-bold ${fileBadge(file.name).className}`}
              >
                {fileBadge(file.name).label}
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-zinc-900">
                  {file.name}
                </div>
                <div className="mt-1 text-xs text-zinc-500">{formatBytes(file.size)}</div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="text-zinc-400 hover:text-zinc-700"
                aria-label="Hapus"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <Field label="CATATAN (OPSIONAL)">
            <textarea
              rows={3}
              placeholder='Highlight untuk penghuni… mis. "Saldo naik 8% karena efisiensi keamanan…"'
              className="w-full resize-none rounded-lg border border-zinc-300 bg-white p-3 text-sm placeholder:italic placeholder:text-zinc-400"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Field>

          <label className="flex items-center gap-3 rounded-lg bg-cream-100 p-3 text-sm">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-brand"
            />
            <div className="flex-1">
              <div className="font-semibold text-zinc-900">
                Notifikasi ke penghuni saat publish
              </div>
              <div className="text-xs italic text-zinc-500">
                Akan dipakai ketika tombol “Publish ke Penghuni” ditekan.
              </div>
            </div>
          </label>

          {submitError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {submitSuccess}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => void submit(false)}
              disabled={submitting}
            >
              {submitting ? "Mengunggah…" : "Simpan Draft"}
            </Button>
            <Button
              onClick={() => void submit(true)}
              disabled={submitting}
            >
              Publish ke Penghuni
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-zinc-900">Arsip Laporan</h3>
          <p className="mb-4 text-xs italic text-zinc-500">
            Per workspace · disimpan di Cloudflare R2
          </p>

          {listError && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {listError}
            </div>
          )}

          <ul className="space-y-3">
            {reports === null && (
              <li className="py-2 text-sm text-zinc-400">Memuat…</li>
            )}
            {reports !== null && reports.length === 0 && (
              <li className="py-2 text-sm text-zinc-400">
                Belum ada laporan. Upload pertama Anda di sebelah kiri.
              </li>
            )}
            {reports?.map((r) => {
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
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === r.id ? null : r.id)}
                    className="text-zinc-400 hover:text-zinc-700"
                    aria-label="Aksi"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpenId === r.id && (
                    <div className="absolute right-3 top-12 z-10 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          void downloadReport(r);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                      >
                        <Download size={14} /> Unduh
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          void togglePublish(r);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                      >
                        {r.status === "published" ? "Jadikan Draft" : "Publish"}
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          void deleteReport(r);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-brand focus:ring-2 focus:ring-(--brand)/20 disabled:bg-zinc-100 disabled:text-zinc-400";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-semibold tracking-wider text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}
