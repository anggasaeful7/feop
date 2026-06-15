"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

const TABS = [
  { label: "Data Petugas", href: "officers" },
  { label: "Data Shift", href: "shifts" },
];

export function PetugasTabs() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale || "id"; // fallback to id if not found

  const basePath = `/${locale}/master-data/petugas`;

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
      {TABS.map((t) => {
        const fullPath = t.href ? `${basePath}/${t.href}` : basePath;
        const isActive = t.href 
          ? pathname.includes(`/master-data/petugas/${t.href}`) 
          : pathname === basePath || pathname === `${basePath}/`;

        return (
          <Link
            key={t.href}
            href={fullPath}
            className={`flex h-10 items-center whitespace-nowrap rounded-full px-5 text-sm font-medium transition ${
              isActive
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
