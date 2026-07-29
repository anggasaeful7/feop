import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { PersonService } from "@/services/person.service";
import type { PersonPayload, PersonQueryParams } from "@/types/master-data";
import type { ComboboxOption } from "@/components/ui/combobox";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { ApiError } from "@/lib/axios";

export const personQK = {
  all: ["persons"] as const,
  lists: () => [...personQK.all, "list"] as const,
  list: (params?: PersonQueryParams) => [...personQK.lists(), params] as const,
  details: () => [...personQK.all, "detail"] as const,
  detail: (id: string) => [...personQK.details(), id] as const,
};

export function usePersons(params?: PersonQueryParams) {
  return useQuery({
    queryKey: personQK.list(params),
    queryFn: () => PersonService.getPersons(params),
  });
}

export function usePersonOptions(search?: string) {
  return useInfiniteQuery({
    queryKey: [...personQK.all, "infinite", search],
    queryFn: ({ pageParam }) =>
      PersonService.getPersons({ search: search || undefined, page: pageParam, per_page: 25 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, per_page, total } = lastPage;
      return page * per_page < total ? page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (data) => ({
      ...data,
      items: data.pages.flatMap((p) => p.items),
    }),
  });
}

export function usePersonComboboxOptions() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const query = usePersonOptions(debouncedSearch);
  const items = useMemo<ComboboxOption[]>(() => {
    const allItems = query.data?.items ?? [];
    return [
      { value: "", label: "— pilih —" },
      ...allItems.map((p) => ({ value: p.id, label: p.full_name })),
    ];
  }, [query.data]);
  return {
    items,
    isLoading: query.isFetchingNextPage,
    isInitialLoading: query.isFetching && !query.isFetchingNextPage,
    hasMore: !!query.hasNextPage,
    loadMore: () => {
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    onSearchChange: setSearch,
  };
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PersonPayload) => PersonService.createPerson(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personQK.all });
      toast.success("Warga berhasil ditambahkan");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menambahkan warga");
    },
  });
}

export function useUpdatePerson(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PersonPayload) => PersonService.updatePerson(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personQK.all });
      toast.success("Warga berhasil diubah");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal mengubah warga");
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => PersonService.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: personQK.all });
      toast.success("Warga berhasil dihapus");
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Gagal menghapus warga");
    },
  });
}
