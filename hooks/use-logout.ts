"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth-storage";
import { useQueryClient } from "@tanstack/react-query";

export function useLogout(redirectTo: string = "/login") {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useCallback(() => {
    clearAuth();
    queryClient.clear();
    router.push(redirectTo);
  }, [router, redirectTo, queryClient]);
}
