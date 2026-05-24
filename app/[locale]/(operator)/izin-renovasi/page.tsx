import { PageHeader } from "@/components/ui";
import { RenovationPermitList } from "./components/renovation-permit-list";

export const metadata = {
  title: "Izin Renovasi - IPL Sistem",
};

export default function IzinRenovasiPage() {
  return (
    <>
      <PageHeader
        title="Izin Renovasi"
        subtitle="Review dan kelola permohonan izin renovasi dari penghuni"
      />
      <div className="mt-6">
        <RenovationPermitList />
      </div>
    </>
  );
}
