import { PageHeader } from "@/components/layout/page-header";
import { PenghuniTabs } from "./components/penghuni-tabs";

export default function PenghuniLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Konfigurasi"
        title="Master Data Penghuni"
        subtitle="Layanan dasar dan fasilitas penghuni"
      />
      <PenghuniTabs />
      {children}
    </>
  );
}
