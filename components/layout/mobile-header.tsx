"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const [prevPathname, setPrevPathname] = useState(pathname);

  // Sync state during render to avoid cascading renders from useEffect
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-200/60 bg-cream-50 px-4 lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <Sidebar className="w-full h-full border-r-0" />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2 font-semibold text-zinc-900">
        <Image src="/logo-icon.png" alt="IPL Sistem" width={24} height={24} className="h-6 w-6" priority />
        <span className="text-sm">IPL Sistem</span>
      </div>
    </header>
  );
}
