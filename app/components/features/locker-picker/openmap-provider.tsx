import { useQuery } from "@tanstack/react-query";
import React from "react";

import type { loader as getOpenStreetMapReverseGeocodingLoader } from "~/api/openmap-search";
import { useDebounceValue } from "~/hooks/use-debounce-value";
import type { OpenStreetMapResult } from "~/lib/types";

type OpenMapContextType = {
  locations: OpenStreetMapResult[];
  isLoading: boolean;
  error?: string;
  search: string;
  onSearchChange: (search: string) => void;
};

const OpenMapContext = React.createContext<OpenMapContextType | null>(null);

const useOpenMap = () => {
  const context = React.useContext(OpenMapContext);
  if (!context) {
    throw new Error("useOpenMap must be used within a OpenMapProvider");
  }
  return context;
};

const OpenMapProvider = ({ children }: { children: React.ReactNode }) => {
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebounceValue(search, 500);

  const {
    data: locations = [],
    isRefetching,
    isLoading: _isLoading,
    error,
  } = useQuery({
    queryKey: ["openmap-search", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: debouncedSearch || "",
      });

      const response = await fetch(`/api/openmap-search?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = (await response.json()) as Awaited<
        ReturnType<typeof getOpenStreetMapReverseGeocodingLoader>
      >["data"];
      return data.results || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
    enabled: debouncedSearch.trim() !== "",
  });

  const isLoading = _isLoading || isRefetching;

  return (
    <OpenMapContext.Provider
      value={{
        search,
        onSearchChange: setSearch,
        locations,
        isLoading,
        error: error?.message,
      }}
    >
      {children}
    </OpenMapContext.Provider>
  );
};

export { OpenMapProvider, OpenMapContext, useOpenMap };
