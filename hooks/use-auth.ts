"use client";

import { useSyncExternalStore } from "react";
import { AUTH_KEYS, readToken, readUser } from "@/lib/auth-storage";
import type { AuthUser } from "@/lib/types";

// `useSyncExternalStore` is the canonical React 19 way to subscribe to
// non-React stores (here, the storage area shared across tabs via the
// `storage` event). The third arg returns `undefined` on the server so
// callers can distinguish "loading on client" from "no value".

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key === AUTH_KEYS.token || e.key === AUTH_KEYS.user) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export function useAccessToken(): string | null | undefined {
  return useSyncExternalStore(subscribe, readToken, () => undefined);
}

export function useAuthUser(): AuthUser | null | undefined {
  return useSyncExternalStore(subscribe, readUser, () => undefined);
}
