"use client";

import { Link, usePathname } from "@/i18n/routing";
import { usePermissions } from "@/hooks/api/use-permissions";

const TABS = [
  { label: "Data RW", href: "rws", requiredRole: "admin_workspace" },
  { label: "Data RT", href: "rts", requiredRole: "admin_workspace" },
  { label: "Unit", href: "units" },
  { label: "Warga", href: "residents" },
  { label: "Tipe Unit", href: "unit-types" },
  { label: "Komponen Tagihan", href: "bill-components" },
  { label: "Tagihan Lainnya", href: "other-bills" },
  { label: "Assign Komponen", href: "assign-components" },
  { label: "Fasilitas", href: "general-facilities" },
  { label: "Kontak Darurat", href: "emergency-contacts" },
];

export function PenghuniTabs() {
  const pathname = usePathname();
  const { data: permissions } = usePermissions();

  const basePath = `/master-data/penghuni`;

  const filteredTabs = TABS.filter((t) => {
    if (t.requiredRole && permissions?.role !== t.requiredRole) {
      return false;
    }
    return true;
  });

  return (
    <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2">
      {filteredTabs.map((t) => {
        const fullPath = `${basePath}/${t.href}`;
        const isActive = pathname === fullPath || pathname.startsWith(fullPath + "/");

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
