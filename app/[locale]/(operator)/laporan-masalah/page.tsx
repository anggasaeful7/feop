import { PageHeader } from "@/components/ui";
import { ComplaintList } from "./components/complaint-list";

export const metadata = {
  title: "Laporan Masalah - IPL Sistem",
};

export default function LaporanMasalahPage() {
  return (
    <>
      <PageHeader
        title="Laporan Masalah"
        subtitle="Kelola laporan masalah dari penghuni"
      />
      <div className="mt-6">
        <ComplaintList />
      </div>
    </>
  );
}
