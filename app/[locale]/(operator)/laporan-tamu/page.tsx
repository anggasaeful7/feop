import { PageHeader } from "@/components/ui";
import { GuestReportList } from "./components/guest-report-list";

export const metadata = {
  title: "Laporan Tamu - IPL Sistem",
};

export default function LaporanTamuPage() {
  return (
    <>
      <PageHeader
        title="Laporan Tamu"
        subtitle="Daftar laporan kedatangan tamu dan pengunjung"
      />
      <div className="mt-6">
        <GuestReportList />
      </div>
    </>
  );
}
