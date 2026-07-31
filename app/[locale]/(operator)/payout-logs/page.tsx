import { PageHeader } from "@/components/layout/page-header";
import { PayoutLogList } from "./components/payout-log-list";

export const metadata = {
  title: "Payout Logs - IPL Sistem",
  description: "Riwayat payout workspace.",
};

export default function PayoutLogsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Admin · Keuangan"
        title="Payout Logs"
        subtitle="Riwayat payout workspace"
      />
      <PayoutLogList />
    </>
  );
}
