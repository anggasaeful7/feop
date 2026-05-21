"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui";
import { ApiError, downloadCSV, uploadCSV } from "@/lib/axios";
import { Modal } from "@/components/ui/modal";

export type ImportSummary = {
  imported: number;
  failed: number;
  errors?: { line: number; message: string }[];
};

export function CSVTools({
  resourceLabel,
  templatePath,
  importPath,
  templateFilename,
  onAfterImport,
}: {
  resourceLabel: string;
  templatePath: string;
  importPath: string;
  templateFilename: string;
  onAfterImport: () => Promise<void> | void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setError(null);
    try {
      await downloadCSV(templatePath, templateFilename);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal mengunduh template");
    }
  }

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const out = await uploadCSV<ImportSummary>(importPath, file);
      setSummary(out);
      await onAfterImport();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal mengimpor CSV");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" onClick={handleDownload}>
        <Download size={14} /> Template
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        <Upload size={14} /> {busy ? "Mengimpor…" : "Impor CSV"}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      {(summary || error) && (
        <Modal
          open
          title={`Impor ${resourceLabel}`}
          onClose={() => {
            setSummary(null);
            setError(null);
          }}
          footer={
            <Button
              onClick={() => {
                setSummary(null);
                setError(null);
              }}
            >
              Tutup
            </Button>
          }
        >
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}
          {summary && (
            <div className="space-y-3">
              <div className="flex gap-3 text-sm">
                <span className="rounded-md bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                  Berhasil: {summary.imported}
                </span>
                <span className="rounded-md bg-rose-100 px-3 py-1 font-semibold text-rose-800">
                  Gagal: {summary.failed}
                </span>
              </div>
              {summary.errors && summary.errors.length > 0 && (
                <div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Detail kesalahan
                  </div>
                  <ul className="max-h-64 overflow-auto rounded-lg border border-zinc-200 text-sm">
                    {summary.errors.map((e, i) => (
                      <li
                        key={i}
                        className="border-b border-zinc-200/70 px-3 py-2 last:border-b-0"
                      >
                        <span className="mr-2 inline-block w-12 font-mono text-xs text-zinc-500">
                          baris {e.line}
                        </span>
                        <span className="text-zinc-800">{e.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
