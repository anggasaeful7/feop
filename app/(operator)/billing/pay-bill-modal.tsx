"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui";
import { ApiError, API_URL, authHeaders } from "@/lib/api";
import { idr } from "@/lib/format";
import { Field, Modal, inputClass } from "@/components/modal";
import type { PaymentQuote, ResidentBill } from "./types";

const MAX_PROOF_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES =
  "image/png,image/jpeg,image/jpg,image/webp,application/pdf";

export function PayBillModal({
  bill,
  onClose,
  onPaid,
}: {
  bill: ResidentBill;
  onClose: () => void;
  onPaid: (next: ResidentBill) => void;
}) {
  const [quote, setQuote] = useState<PaymentQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({
          amount: String(bill.base_amount),
        });
        const res = await fetch(
          `${API_URL}/api/v1/platform-billing/quote?${params}`,
          {
            headers: authHeaders(),
            credentials: "include",
          },
        );
        const body = (await res.json().catch(() => null)) as
          | { data: PaymentQuote }
          | { error: { message: string } }
          | null;
        if (cancelled) return;
        if (!res.ok || !body || !("data" in body)) {
          setQuoteError(
            body && "error" in body ? body.error.message : "Gagal memuat biaya",
          );
          return;
        }
        setQuote(body.data);
      } catch (e) {
        if (!cancelled)
          setQuoteError(e instanceof Error ? e.message : "Gagal memuat biaya");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bill.base_amount]);

  function pickFile(f: File | null) {
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > MAX_PROOF_BYTES) {
      setError("File terlalu besar (maks 8 MB).");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setError(null);
    setFile(f);
  }

  async function handle() {
    setError(null);
    if (!file) {
      setError("Pilih file bukti bayar terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("proof", file);
      if (paidAt) {
        fd.append("paid_at", new Date(paidAt + "T12:00:00").toISOString());
      }
      if (notes.trim() !== "") fd.append("notes", notes.trim());

      const res = await fetch(
        `${API_URL}/api/v1/resident-bills/${bill.id}/pay`,
        {
          method: "PATCH",
          headers: authHeaders(),
          credentials: "include",
          body: fd,
        },
      );
      const body = (await res.json().catch(() => null)) as
        | { data: ResidentBill }
        | { error: { message: string } }
        | null;
      if (!res.ok || !body || !("data" in body)) {
        const msg =
          body && "error" in body ? body.error.message : `Upload gagal (${res.status})`;
        throw new ApiError(res.status, { code: "upload_failed", message: msg });
      }
      onPaid(body.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memproses pembayaran");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open
      title={`Tandai Lunas — ${bill.title}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handle} disabled={submitting || !file}>
            {submitting ? "Memproses…" : "Tandai Lunas"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/50 px-4 py-3">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Tagihan
              </div>
              <div className="mt-0.5 font-semibold text-zinc-900">
                {idr(bill.base_amount)}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Biaya Platform
              </div>
              <div className="mt-0.5 font-semibold text-zinc-900">
                {quote ? idr(quote.platform_fee) : quoteError ? "—" : "…"}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Total
              </div>
              <div className="mt-0.5 font-bold text-emerald-700">
                {quote ? idr(quote.total_amount) : "—"}
              </div>
            </div>
          </div>
          {quoteError && (
            <p className="mt-2 text-xs text-amber-700">{quoteError}</p>
          )}
        </div>

        <Field
          label="Bukti Bayar"
          hint="PNG, JPG, WEBP atau PDF · maks 8 MB"
        >
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-full file:border-0 file:bg-brand-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-700"
          />
          {file && (
            <p className="mt-1 text-xs italic text-zinc-500">
              {file.name} · {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
        </Field>

        <Field label="Tanggal Pembayaran">
          <input
            type="date"
            className={inputClass}
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
          />
        </Field>

        <Field label="Catatan">
          <input
            className={inputClass}
            placeholder="Opsional · misal nomor referensi transfer"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>

        <p className="flex items-center gap-2 text-xs italic text-zinc-500">
          <Upload size={12} /> File akan di-upload ke storage workspace ini.
        </p>
      </div>
      {error && (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
    </Modal>
  );
}
