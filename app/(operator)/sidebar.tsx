"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  CreditCard,
  Database,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuthUser } from "./use-auth";

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/billing", label: "Manage Billing", Icon: Receipt },
  { href: "/billing/penghuni", label: "Billing Penghuni", Icon: Users },
  { href: "/laporan", label: "Upload Laporan", Icon: Upload },
  { href: "/fasilitas", label: "Fasilitas", Icon: Building2 },
  { href: "/master-data", label: "Master Data", Icon: Database },
  { href: "/notifikasi", label: "Notifikasi", Icon: Bell },
  { href: "/platform-billing", label: "Biaya Platform", Icon: CreditCard },
  { href: "/pengaturan", label: "Pengaturan", Icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthUser();

  function handleLogout() {
    window.localStorage.removeItem("ipl_access_token");
    window.localStorage.removeItem("ipl_user");
    window.sessionStorage.removeItem("ipl_access_token");
    window.sessionStorage.removeItem("ipl_user");
    router.push("/login");
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200/60 bg-cream-50">
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

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, Icon }) => {
          const matches =
            pathname === href || pathname.startsWith(href + "/");
          const moreSpecificMatch = NAV.some(
            (other) =>
              other.href !== href &&
              other.href.startsWith(href + "/") &&
              (pathname === other.href ||
                pathname.startsWith(other.href + "/")),
          );
          const active = matches && !moreSpecificMatch;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-brand-900 font-semibold text-white"
                  : "text-zinc-700 hover:bg-cream-200/60"
              }`}
            >
              <Icon
                size={18}
                aria-hidden="true"
                className={active ? "text-white" : "text-zinc-500"}
              />
              {label}
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
          onClick={handleLogout}
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
