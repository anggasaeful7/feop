import { AlertTriangle, Check, X } from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/ui";

export default async function VerifikasiPage({
  params,
}: {
  params: Promise<{ unit: string }>;
}) {
  const { unit } = await params;

  return (
    <>
      <PageHeader
        eyebrow={`Penghuni · ${unit} · Bu Linda`}
        title="Verifikasi Bukti Bayar"
        subtitle="Review upload transfer dari penghuni"
        actions={
          <>
            <Button variant="danger">
              <X size={16} /> Tolak
            </Button>
            <Button>
              <Check size={16} /> Setujui & Tandai Lunas
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200/70 px-6 py-4">
            <h3 className="text-lg font-bold text-zinc-900">Bukti Transfer</h3>
            <div className="text-xs italic text-zinc-500">
              IMG_20260423.jpg · 1.2 MB
            </div>
          </div>
          <div className="grid place-items-center bg-brand-900 p-12">
            <div className="w-80 rounded-2xl bg-white p-6 shadow-2xl">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                BCA
              </div>
              <div className="mt-3 text-center text-base font-semibold text-zinc-900">
                Transfer Berhasil
              </div>
              <div className="text-center text-xs italic text-zinc-500">
                23 Apr 2026 · 14:32
              </div>
              <div className="my-4 border-t border-zinc-200" />
              <div className="text-center text-xl font-semibold text-zinc-900">
                Rp 450.000
              </div>
              <div className="my-4 border-t border-zinc-200" />
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-500">Dari</dt>
                  <dd className="font-mono text-zinc-900">LINDA ANGGRAINI</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-500">Ke</dt>
                  <dd className="font-mono text-zinc-900">RT 03 CLUSTER MAWAR</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-500">Rek</dt>
                  <dd className="font-mono text-zinc-900">1234-5678-90</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-500">Berita</dt>
                  <dd className="font-mono text-zinc-900">IPL APR A-12 (SALAH)</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-zinc-500">Ref</dt>
                  <dd className="font-mono text-zinc-900">FT26113472182</dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-4 text-lg font-bold text-zinc-900">Detail Klaim</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Unit / Penghuni" value="B-02 · Bu Linda (aslinya)" />
              <Row label="Untuk tagihan" value="IPL April 2026" />
              <Row label="Jumlah diklaim" value="Rp 450.000" />
              <Row label="Metode" value="Transfer BCA" />
              <Row label="Diupload" value="23 Apr · 14:35 (3 menit lalu)" />
              <Row
                label="Catatan penghuni"
                value={`"Sudah ditransfer ya pak, maaf telat"`}
                italic
              />
            </dl>
          </Card>

          <Card className="border-amber-300 bg-amber-50/60">
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-200 text-amber-800">
                <AlertTriangle size={16} />
              </div>
              <div>
                <div className="font-semibold text-amber-800">
                  Peringatan auto-check
                </div>
                <div className="mt-1 text-sm text-amber-900/80">
                  Berita transfer menyebut <b>&quot;A-12&quot;</b>, tapi upload dari
                  unit <b>B-02</b>. Konfirmasi dengan penghuni sebelum approve.
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-lg font-bold text-zinc-900">Riwayat Unit B-02</h3>
            <ul className="space-y-2 text-sm">
              {[
                { p: "Mar 2026", d: "8 Mar" },
                { p: "Feb 2026", d: "3 Feb" },
                { p: "Jan 2026", d: "28 Jan" },
              ].map((h) => (
                <li
                  key={h.p}
                  className="flex items-center justify-between border-b border-zinc-200/60 py-2 last:border-b-0"
                >
                  <span className="font-medium text-zinc-800">{h.p}</span>
                  <span className="italic text-zinc-500">{h.d}</span>
                  <Badge tone="success">Lunas</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
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
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd
        className={`text-right font-medium text-zinc-900 ${italic ? "italic" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}
