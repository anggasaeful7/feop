"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { useAccessToken } from "@/hooks/use-auth";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAccessToken();

  useEffect(() => {
    if (token === null) router.replace("/login");
  }, [token, router]);

  if (token === undefined || token === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50 text-sm text-zinc-500">
        Memuat…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream-50">
      <Sidebar />
      <main className="flex-1 bg-cream-100 p-8">{children}</main>
    </div>
  );
}
