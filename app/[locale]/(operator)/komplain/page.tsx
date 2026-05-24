import { PageHeader } from "@/components/ui";
import { ComplaintList } from "./components/complaint-list";

export const metadata = {
  title: "Komplain - IPL Sistem",
};

export default function KomplainPage() {
  return (
    <>
      <PageHeader
        title="Komplain Penghuni"
        subtitle="Kelola laporan komplain dari penghuni"
      />
      <div className="mt-6">
        <ComplaintList />
      </div>
    </>
  );
}
