import { PageHeader } from "@/components/ui";
import { LetterRequestList } from "./components/letter-request-list";

export const metadata = {
  title: "Pengajuan Surat - IPL Sistem",
};

export default function PengajuanSuratPage() {
  return (
    <>
      <PageHeader
        title="Pengajuan Surat"
        subtitle="Review dan kelola permohonan surat dari penghuni"
      />
      <div className="mt-6">
        <LetterRequestList />
      </div>
    </>
  );
}
