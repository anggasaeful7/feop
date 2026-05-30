import { redirect } from "next/navigation";

export default async function MasterDataPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/master-data/units`);
}
