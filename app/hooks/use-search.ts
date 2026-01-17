import { useQuery } from "@tanstack/react-query";
import { parseAsString, useQueryState } from "nuqs";
import { useSearchParams } from "react-router";

import type { loader as filterItemsLoader } from "~/api/filter-items";

export function useSearch({
  limit = 5,
  debounceTime = 500,
  charactersThreshold = 2,
}: {
  limit?: number;
  debounceTime?: number;
  charactersThreshold?: number;
} = {}) {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      shallow: false,
      limitUrlUpdates: {
        method: "debounce",
        timeMs: debounceTime,
      },
    })
  );

  const [searchParams] = useSearchParams();
  const debouncedSearch = searchParams.get("search") || "";

  const { data, isLoading, isRefetching, error, isError } = useQuery({
    queryKey: ["search", debouncedSearch, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearch,
        take: limit.toString(),
      });

      const response = await fetch(`/api/filter-items?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = (await response.json()) as Awaited<
        ReturnType<typeof filterItemsLoader>
      >["data"];
      return data.results || [];
    },
    enabled:
      Boolean(debouncedSearch) && debouncedSearch.length >= charactersThreshold,
    retry: 1, // Only retry once on failure
    staleTime: 30000, // Cache results for 30 seconds
  });

  const hasSearch = search.trim().length > 2;

  return {
    search,
    setSearch,
    data,
    isLoading: isLoading || isRefetching,
    error: error as Error | null,
    isError,
    hasSearch,
  };
}
