"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

const TABS = [
  { label: "Unit", href: "units" },
  { label: "Warga", href: "residents" },
  { label: "Tipe Unit", href: "unit-types" },
  { label: "Komponen Tagihan", href: "bill-components" },
  { label: "Tagihan Lainnya", href: "other-bills" },
  { label: "Assign Komponen", href: "assign-components" },
  { label: "Fasilitas", href: "general-facilities" },
  { label: "Kontak Darurat", href: "emergency-contacts" },
];

export function MasterDataTabs() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || "id"; // fallback to id if not found

  const basePath = `/${locale}/master-data`;

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
      {TABS.map((t) => {
        const fullPath = `${basePath}/${t.href}`;
        const isActive = pathname.includes(`/master-data/${t.href}`);

        return (
          <Link
            key={t.href}
            href={fullPath}
            className={`flex h-10 items-center whitespace-nowrap rounded-full px-5 text-sm font-medium transition ${isActive
              ? "bg-brand-900 text-white"
              : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
