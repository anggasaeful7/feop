"use client";

import type { AuthUser } from "@/types";

export const AUTH_KEYS = {
  token: "ipl_access_token",
  user: "ipl_user",
} as const;

function storages(): Storage[] {
  if (typeof window === "undefined") return [];
  return [window.localStorage, window.sessionStorage];
}

export function readToken(): string | null {
  for (const s of storages()) {
    const v = s.getItem(AUTH_KEYS.token);
    if (v) return v;
  }
  return null;
}

let cachedUserRaw: string | null = null;
let cachedUserParsed: AuthUser | null = null;

export function readUser(): AuthUser | null {
  for (const s of storages()) {
    const raw = s.getItem(AUTH_KEYS.user);
    if (!raw) continue;
    if (raw === cachedUserRaw) {
      return cachedUserParsed;
    }
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      cachedUserRaw = raw;
      cachedUserParsed = parsed;
      return parsed;
    } catch {
      return null;
    }
  }
  cachedUserRaw = null;
  cachedUserParsed = null;
  return null;
}

export function writeAuth(token: string, user: AuthUser, remember: boolean) {
  if (typeof window === "undefined") return;
  const target = remember ? window.localStorage : window.sessionStorage;
  const other = remember ? window.sessionStorage : window.localStorage;
  target.setItem(AUTH_KEYS.token, token);
  target.setItem(AUTH_KEYS.user, JSON.stringify(user));
  other.removeItem(AUTH_KEYS.token);
  other.removeItem(AUTH_KEYS.user);

  const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
  document.cookie = `${AUTH_KEYS.token}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  for (const s of storages()) {
    s.removeItem(AUTH_KEYS.token);
    s.removeItem(AUTH_KEYS.user);
  }
  document.cookie = `${AUTH_KEYS.token}=; path=/; max-age=0; samesite=lax`;
}
