"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Button, Card } from "@/components/ui";
import { api, ApiError } from "@/lib/axios";
import { idr } from "@/lib/format";
import { Field, inputClass } from "@/components/ui/modal";
import type { WorkspaceFee, WorkspaceFeePayload } from "@/types/platform-billing";

const PREVIEW_AMOUNTS = [50_000, 150_000, 350_000, 500_000];

export default function PlatformBillingPage() {
  const [fee, setFee] = useState<WorkspaceFee | null>(null);
  const [override, setOverride] = useState(false);
  const [feeInput, setFeeInput] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const f = await api<WorkspaceFee>("/api/v1/platform-billing/fee");
        if (cancelled) return;
        setFee(f);
        setOverride(f.override_platform_fee != null);
        setFeeInput(f.override_platform_fee ?? f.effective_platform_fee);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof ApiError ? e.message : "Gagal memuat data");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const previewFee = override ? feeInput : fee?.default_platform_fee ?? 0;

  const samples = useMemo(
    () =>
      PREVIEW_AMOUNTS.map((base) => ({
        base,
        fee: previewFee,
        total: base + previewFee,
      })),
    [previewFee],
  );

  async function handleSave() {
    if (override && feeInput < (fee?.min_platform_fee ?? 0)) {
      setError(
        `Biaya platform minimal Rp ${(fee?.min_platform_fee ?? 0).toLocaleString("id-ID")}`,
      );
      return;
    }
    setSubmitting(true);
    setError(null);
    setSaved(null);
    try {
      const payload: WorkspaceFeePayload = {
        platform_fee: override ? Number(feeInput) : null,
      };
      const next = await api<WorkspaceFee>("/api/v1/platform-billing/fee", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setFee(next);
      setOverride(next.override_platform_fee != null);
      setFeeInput(next.override_platform_fee ?? next.effective_platform_fee);
      setSaved("Tersimpan");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal menyimpan");
    } finally {
      setSubmitting(false);
    }
  }

  if (!fee) {
    return (
      <>
        <Header />
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">Memuat…</p>
        )}
      </>
    );
  }

  return (
    <>
      <Header />

      <Card className="mb-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-zinc-900">Biaya Platform Saat Ini</h3>
            <p className="mt-0.5 text-sm text-zinc-500">
              Biaya ini ditambahkan ke setiap pembayaran tagihan oleh penghuni / pemilik (IPL bulanan maupun tagihan tertentu).
            </p>
          </div>
          <Badge tone={fee.override_platform_fee != null ? "info" : "neutral"}>
            {fee.override_platform_fee != null ? "Override" : "Mengikuti Default"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Stat label="Biaya Aktif" value={idr(fee.effective_platform_fee)} highlight />
          <Stat label="Default Platform" value={idr(fee.default_platform_fee)} />
          <Stat label="Minimum" value={idr(fee.min_platform_fee)} />
        </div>
      </Card>

      <Card className="mb-4">
        <h3 className="text-xl font-bold text-zinc-900">Atur Biaya Platform</h3>
        <p className="mt-0.5 text-sm text-zinc-500">
          Anda dapat menaikkan biaya platform untuk workspace ini, minimal sebesar nilai yang ditetapkan platform.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
        {saved && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {saved}
          </div>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={override}
            onChange={(e) => setOverride(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 accent-brand"
          />
          Override default platform ({idr(fee.default_platform_fee)})
        </label>

        {override && (
          <div className="mt-3 max-w-xs">
            <Field
              label="Biaya Platform (Rp)"
              hint={`Minimal ${idr(fee.min_platform_fee)}`}
            >
              <input
                type="number"
                min={fee.min_platform_fee}
                step="500"
                className={inputClass}
                value={feeInput}
                onChange={(e) => setFeeInput(Number(e.target.value))}
              />
            </Field>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button onClick={handleSave} disabled={submitting}>
            <Save size={14} /> {submitting ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-xl font-bold text-zinc-900">Preview Pembayaran Penghuni</h3>
        <p className="mt-0.5 text-sm text-zinc-500">
          Simulasi tagihan + biaya platform yang akan ditampilkan saat penghuni membayar.
        </p>

        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              <th className="px-3 py-3 text-left">Tagihan</th>
              <th className="px-3 py-3 text-right">Biaya Platform</th>
              <th className="px-3 py-3 text-right">Total Dibayar</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((s) => (
              <tr key={s.base} className="border-t border-zinc-200/70">
                <td className="px-3 py-3 text-zinc-800">{idr(s.base)}</td>
                <td className="px-3 py-3 text-right text-zinc-700">+ {idr(s.fee)}</td>
                <td className="px-3 py-3 text-right font-semibold text-zinc-900">
                  {idr(s.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {override && feeInput !== (fee.override_platform_fee ?? fee.default_platform_fee) && (
          <p className="mt-3 text-xs italic text-amber-700">
            Belum disimpan — preview di atas memakai nilai input saat ini ({idr(feeInput)}).
          </p>
        )}
      </Card>
    </>
  );
}

function Header() {
  return (
    <PageHeader
      eyebrow="Workspace · Biaya Platform"
      title="Biaya Platform"
      subtitle="Surcharge yang ditambahkan ke setiap pembayaran penghuni / pemilik"
    />
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        highlight
          ? "border-emerald-200/70 bg-emerald-50/70"
          : "border-zinc-200/70 bg-white"
      }`}
    >
      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-zinc-900">{value}</div>
    </div>
  );
}
