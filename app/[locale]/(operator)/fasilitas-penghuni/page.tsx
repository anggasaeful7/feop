import { FasilitasPenghuniList } from "./components/fasilitas-penghuni-list";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Fasilitas Penghuni - IPL Sistem",
};

export default function FasilitasPenghuniPage() {
  return (
    <>
      <PageHeader
        eyebrow="Billing · Operasional"
        title="Fasilitas Penghuni"
        subtitle="Daftar fasilitas umum yang di-assign ke unit"
      />
      <FasilitasPenghuniList />
    </>
  );
}
