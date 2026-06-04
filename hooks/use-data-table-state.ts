import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useDebounce } from "./use-debounce";

export function useDataTableState(defaultPerPage = 10, debounceMs = 500) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlPerPage = Number(searchParams.get("per_page")) || defaultPerPage;

  const [search, setSearch] = useState(urlSearch);
  const debouncedSearch = useDebounce(search, debounceMs);

  // Sync debounced search to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;
    
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      } else {
        params.delete("search");
      }
      // Reset page to 1 on new search to avoid empty states
      params.set("page", "1");
      changed = true;
    }

    if (changed) {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedSearch, pathname, router, searchParams]);

  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);

  // Sync from URL to local state (for back/forward navigation)
  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const setPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPage > 1) {
        params.set("page", newPage.toString());
      } else {
        params.delete("page");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const setPerPage = useCallback(
    (newPerPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newPerPage !== defaultPerPage) {
        params.set("per_page", newPerPage.toString());
      } else {
        params.delete("per_page");
      }
      params.delete("page"); // Reset to page 1
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [defaultPerPage, pathname, router, searchParams]
  );

  return {
    search,
    setSearch,
    debouncedSearch, // Use this for API queries
    page: urlPage,
    setPage,
    perPage: urlPerPage,
    setPerPage,
  };
}
