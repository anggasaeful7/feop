import { PageHeader } from "@/components/layout/page-header";
import { PetugasTabs } from "./components/petugas-tabs";

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Konfigurasi"
        title="Master Data Petugas"
        subtitle="Manajemen petugas dan jadwal shift"
      />
      <PetugasTabs />
      {children}
    </>
  );
}
