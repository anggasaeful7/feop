"use client";

import { Sidebar } from "@/components/layout/sidebar";

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-cream-50">
      <Sidebar />
      <main className="flex-1 bg-cream-100 p-8">{children}</main>
    </div>
  );
}
