import { PageHeader } from "@/components/layout/page-header";
import { ResidentBillList } from "./components/resident-bill-list";

export const metadata = {
  title: "Billing Penghuni - IPL Sistem",
  description: "Kelola status pembayaran per unit dan verifikasi bukti transfer iuran penghuni.",
};

export default function BillingPenghuniPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Kelola Tagihan"
        title="Billing Penghuni"
        subtitle="Status pembayaran per unit · Verifikasi bukti transfer"
      />
      <ResidentBillList />
    </>
  );
}
