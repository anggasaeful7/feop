import { redirect } from "@/i18n/routing";

export default async function PetugasRootPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/master-data/petugas/officers", locale });
}
