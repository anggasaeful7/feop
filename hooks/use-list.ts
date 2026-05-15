"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Paged } from "@/lib/types";

// Generic paged-list loader with refresh + manual error reset.
// Returns `items === null` until the first response arrives.
export function useList<T>(path: string) {
  const [items, setItems] = useState<T[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const out = await api<Paged<T>>(path);
      setItems(out.items);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Gagal memuat data");
    }
  }, [path]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const out = await api<Paged<T>>(path);
        if (!cancelled) {
          setItems(out.items);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "Gagal memuat data");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { items, error, reload, setError };
}
