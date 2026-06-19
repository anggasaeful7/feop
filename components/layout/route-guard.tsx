"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { usePermissions, hasPermission } from "@/hooks/api/use-permissions";
import { ROUTE_PERMISSIONS } from "@/config/route-permissions";
import { Loader2 } from "lucide-react";

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: permissions, isLoading } = usePermissions();

  useEffect(() => {
    if (isLoading || !permissions) return;

    // Find the most specific matching route
    const matchedRoute = ROUTE_PERMISSIONS.filter((r) => {
      if (r.exact) return pathname === r.path;
      return pathname === r.path || pathname.startsWith(r.path + "/");
    }).sort((a, b) => b.path.length - a.path.length)[0]; // Longest match first

    if (matchedRoute) {
      if (matchedRoute.requiredRole && permissions.role !== matchedRoute.requiredRole) {
        router.replace("/dashboard");
        return;
      }
      if (matchedRoute.requiredResource && !hasPermission(permissions, matchedRoute.requiredResource, "read")) {
        router.replace("/dashboard");
        return;
      }
    }
  }, [pathname, permissions, isLoading, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-cream-50">
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute h-24 w-24 animate-ping rounded-full bg-brand-200 opacity-20"></div>
          <Image
            src="/logo-icon.png"
            alt="IPL Sistem Logo"
            width={64}
            height={64}
            className="h-16 w-16 animate-pulse"
            priority
          />
        </div>
        <Loader2 className="h-6 w-6 animate-spin text-brand-900" />
        <p className="mt-4 text-sm font-medium text-zinc-500 animate-pulse">Memuat aplikasi...</p>
      </div>
    );
  }

  // Prevent rendering protected content before redirect happens
  if (permissions) {
    const matchedRoute = ROUTE_PERMISSIONS.filter((r) => {
      if (r.exact) return pathname === r.path;
      return pathname === r.path || pathname.startsWith(r.path + "/");
    }).sort((a, b) => b.path.length - a.path.length)[0];

    if (matchedRoute) {
      if (matchedRoute.requiredRole && permissions.role !== matchedRoute.requiredRole) return null;
      if (matchedRoute.requiredResource && !hasPermission(permissions, matchedRoute.requiredResource, "read")) return null;
    }
  }

  return <>{children}</>;
}
