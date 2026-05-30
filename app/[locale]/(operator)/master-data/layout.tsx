import { PageHeader } from "@/components/layout/page-header";

import { MasterDataTabs } from "./components/master-data-tabs";

export default function MasterDataLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Konfigurasi"
        title="Master Data"
        subtitle="Layanan dasar dan fasilitas"
      />
      <MasterDataTabs />
      {children}
    </>
  );
}
