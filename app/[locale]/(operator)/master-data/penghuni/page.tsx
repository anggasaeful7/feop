import { redirect } from "@/i18n/routing";

export default async function PenghuniRootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/master-data/penghuni/units", locale });
}
