import { type UseQueryStatesReturn, useQueryStates } from "nuqs";
import React from "react";

import { formatCurrency, getFilterSearchParams } from "~/lib/utils";

type FiltersContextType = {
  filters: UseQueryStatesReturn<ReturnType<typeof getFilterSearchParams>>[0];
  setFilters: UseQueryStatesReturn<ReturnType<typeof getFilterSearchParams>>[1];
  filterValues: { label: string; value: string; param: string }[];
  onRemoveFilter: (param: string, value: string) => void;
};

const FiltersContext = React.createContext<FiltersContextType | null>(null);

const useFilters = () => {
  const context = React.useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};

export function FiltersProvider({
  children,
  priceMax = 100000,
  priceMin = 0,
  tags,
  sizes,
  brands,
}: {
  children: React.ReactNode;
  priceMin?: number;
  priceMax?: number;
  tags: { name: string; slug: string }[];
  sizes: { name: string; slug: string }[];
  brands: { name: string; slug: string }[];
}) {
  const [filters, _setFilters] = useQueryStates(
    getFilterSearchParams({
      priceMin: priceMin,
      priceMax: priceMax,
    }),
    {
      shallow: false,
    }
  );

  const setFilters = React.useCallback(
    (...args: Parameters<typeof _setFilters>) =>
      _setFilters((prev) => {
        const newFilters =
          typeof args[0] === "function" ? args[0](prev) : args[0];
        if (newFilters?.page !== undefined) newFilters.page = 1;
        return newFilters;
      }),
    [_setFilters]
  );

  const filterValues = React.useMemo(() => {
    return [
      ...filters.tags.map((tag) => ({
        label: tags.find((t) => t.slug === tag)?.name ?? tag,
        value: tag,
        param: "tags",
      })),
      ...filters.sizes.map((size) => ({
        label: sizes.find((s) => s.slug === size)?.name ?? size,
        value: size,
        param: "sizes",
      })),
      ...filters.brands.map((brand) => ({
        label: brands.find((b) => b.slug === brand)?.name ?? brand,
        value: brand,
        param: "brands",
      })),
      ...(filters.gender
        ? [
            {
              label:
                {
                  male: "Men",
                  female: "Women",
                  unisex: "Unisex",
                }[filters.gender] ?? filters.gender,
              value: filters.gender,
              param: "gender",
            },
          ]
        : []),
      ...(filters.priceMin !== priceMin || filters.priceMax !== priceMax
        ? [
            {
              label: `${formatCurrency(filters.priceMin)} - ${formatCurrency(filters.priceMax)}`,
              value: `${filters.priceMin}-${filters.priceMax}`,
              param: "priceMin",
            },
          ]
        : []),
    ];
  }, [filters]);

  const onRemoveFilter = React.useCallback(
    (param: string, value: string) =>
      _setFilters((prev) => {
        switch (param) {
          case "tags":
          case "sizes":
          case "brands":
            return {
              ...prev,
              [param]: prev[param].filter((v) => v !== value),
              page: 1,
            };
          case "priceMin":
          case "priceMax":
            return {
              ...prev,
              priceMin: null,
              priceMax: null,
              page: 1,
            };
          case "gender":
            return {
              ...prev,
              gender: null,
              page: 1,
            };
          default:
            console.warn(`Unknown filter param: ${param}`);
            return prev;
        }
      }),
    [setFilters]
  );

  return (
    <FiltersContext.Provider
      value={{ filters, setFilters, filterValues, onRemoveFilter }}
    >
      {children}
    </FiltersContext.Provider>
  );
}

export { useFilters };
