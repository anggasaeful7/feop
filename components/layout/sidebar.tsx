"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Mail,
  Receipt,
  Settings,
  ChevronDown,
  ChevronRight,
  Database,
  type LucideIcon,
} from "lucide-react";
import { useAuthUser } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

type NavItem = {
  href?: string;
  label: string;
  Icon: LucideIcon;
  activePath?: string;
  children?: { href: string; label: string }[];
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  {
    label: "Billing",
    Icon: Receipt,
    children: [
      { href: "/penghuni", label: "Billing Penghuni" },
      { href: "/fasilitas-penghuni", label: "Fasilitas Penghuni" },
      { href: "/laporan", label: "Upload Laporan" },
    ],
  },
  {
    label: "Layanan Warga",
    Icon: Mail,
    children: [
      { href: "/laporan-masalah", label: "Laporan Masalah" },
      { href: "/laporan-tamu", label: "Laporan Tamu" },
      { href: "/pengajuan-surat", label: "Pengajuan Surat" },
      { href: "/izin-renovasi", label: "Izin Renovasi" },
    ],
  },
  {
    label: "Fasilitas & Jadwal",
    Icon: Building2,
    children: [
      { href: "/fasilitas", label: "Fasilitas Umum" },
      { href: "/jadwal/keamanan", label: "Jadwal Keamanan" },
      { href: "/jadwal/kebersihan", label: "Jadwal Kebersihan" },
    ],
  },
  {
    href: "/master-data/units",
    activePath: "/master-data",
    label: "Master Data",
    Icon: Database,
  },
  {
    label: "Pengaturan & Lainnya",
    Icon: Settings,
    children: [
      { href: "/platform-billing", label: "Biaya Platform" },
      { href: "/notifikasi", label: "Notifikasi" },
      { href: "/pengaturan", label: "Pengaturan" },
    ],
  },
];

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const hasActiveChild = item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  );
  const [isOpen, setIsOpen] = useState(hasActiveChild || false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Sync state during render to avoid cascading renders from useEffect
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-cream-200/60"
      >
        <div className="flex items-center gap-3">
          <item.Icon size={18} aria-hidden="true" className="text-zinc-500" />
          {item.label}
        </div>
        {isOpen ? (
          <ChevronDown size={16} className="text-zinc-400" />
        ) : (
          <ChevronRight size={16} className="text-zinc-400" />
        )}
      </button>
      {isOpen && (
        <div className="ml-9 space-y-1">
          {item.children?.map((child) => {
            // Precise matching to prevent parent path matching child path incorrectly if similar
            const active =
              pathname === child.href || pathname.startsWith(child.href + "/");
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${active
                  ? "bg-brand-900 font-semibold text-white"
                  : "text-zinc-600 hover:bg-cream-200/60 hover:text-zinc-900"
                  }`}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const user = useAuthUser();
  const logout = useLogout();

  return (
    <aside className={cn("sticky top-0 h-screen flex w-64 shrink-0 flex-col border-r border-zinc-200/60 bg-cream-50", className)}>
      <div className="flex items-center gap-3 px-6 pt-6 pb-8">
        <Image
          src="/logo-icon.png"
          alt="IPL Sistem"
          width={40}
          height={40}
          priority
          className="h-10 w-10 shrink-0"
        />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-zinc-900">IPL Sistem</div>
          <div className="text-xs text-zinc-500">Cluster Mawar</div>
        </div>
      </div>

      <div className="px-6 pb-2 text-[11px] font-semibold tracking-widest text-zinc-400">
        WORKSPACE
      </div>

      <nav className="flex-1 overflow-y-auto space-y-1 px-3 custom-scrollbar">
        {NAV.map((item) => {
          if (item.children) {
            return <NavGroup key={item.label} item={item} pathname={pathname} />;
          }

          const href = item.href!;
          const activePath = item.activePath ?? href;
          const matches = pathname === activePath || pathname.startsWith(activePath + "/");
          // Check if there's any other route that is more specific (for single items)
          let moreSpecificMatch = false;
          NAV.forEach((other) => {
            const otherHref = other.href!;
            const otherActivePath = other.activePath ?? otherHref;
            if (other.children) {
              moreSpecificMatch =
                moreSpecificMatch ||
                other.children.some(
                  (child) =>
                    child.href !== href &&
                    child.href.startsWith(activePath + "/") &&
                    (pathname === child.href || pathname.startsWith(child.href + "/"))
                );
            } else {
              moreSpecificMatch =
                moreSpecificMatch ||
                (otherHref !== href &&
                  otherActivePath.startsWith(activePath + "/") &&
                  (pathname === otherHref || pathname.startsWith(otherHref + "/")));
            }
          });

          const active = matches && !moreSpecificMatch;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active
                ? "bg-brand-900 font-semibold text-white"
                : "text-zinc-700 hover:bg-cream-200/60"
                }`}
            >
              <item.Icon
                size={18}
                aria-hidden="true"
                className={active ? "text-white" : "text-zinc-500"}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 mt-2 flex items-center justify-between rounded-xl border border-zinc-200/60 bg-white/40 px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
            {user ? initials(user.full_name) : "RT"}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-zinc-900">
              {user?.full_name ?? "Pak RT 03"}
            </div>
            <div className="text-xs text-zinc-500 capitalize">
              {user?.role.replace(/_/g, " ") ?? "Owner"}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          aria-label="Logout"
          title="Logout"
          className="text-zinc-400 hover:text-zinc-700"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
