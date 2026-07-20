import { PageHeader } from "@/components/layout/page-header";
import { ReportForm } from "./components/report-form";
import { ReportList } from "./components/report-list";

export default function LaporanPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Transparansi kas"
        title="Upload Laporan"
        subtitle="Upload laporan bulanan/tahunan agar penghuni bisa lihat"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ReportForm />
        <ReportList />
      </div>
    </>
  );
}
