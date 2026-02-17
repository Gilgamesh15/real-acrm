import { useQuery } from "@tanstack/react-query";
import superjson from "superjson";

import type { DBQueryResult } from "~/lib/types";

type FeaturedProduct = DBQueryResult<
  "products",
  {
    columns: {
      description: false;
    };
    with: {
      images: true;
      discount: true;
      pieces: {
        with: {
          images: true;
          brand: true;
          size: true;
          category: true;
          discount: true;
        };
      };
    };
  }
>;

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const params = new URLSearchParams({
        scope: "featured",
        orderBy: "featuredOrder",
        sortOrder: "desc",
        limit: "30",
        cache: "300",
        description: "false",
        images: "primary",
        piecesImages: "primary",
      });

      const response = await fetch(`/api/products?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      const data = superjson.deserialize<{ products: FeaturedProduct[] }>(json);
      return data.products;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
