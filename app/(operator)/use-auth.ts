"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function readToken() {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("ipl_access_token") ??
    window.sessionStorage.getItem("ipl_access_token")
  );
}

function readUser() {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem("ipl_user") ??
    window.sessionStorage.getItem("ipl_user")
  );
}

type AuthUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  workspace_id?: string;
};

export function useAccessToken(): string | null | undefined {
  return useSyncExternalStore(
    subscribe,
    readToken,
    () => undefined,
  );
}

export function useAuthUser(): AuthUser | null | undefined {
  const raw = useSyncExternalStore(subscribe, readUser, () => undefined);
  if (raw === undefined) return undefined;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
