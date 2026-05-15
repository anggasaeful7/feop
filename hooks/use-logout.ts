"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth-storage";

export function useLogout(redirectTo: string = "/login") {
  const router = useRouter();
  return useCallback(() => {
    clearAuth();
    router.push(redirectTo);
  }, [router, redirectTo]);
}
