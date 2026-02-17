import { useQuery } from "@tanstack/react-query";
import superjson from "superjson";

import type { DBQueryResult } from "~/lib/types";

type HomeTag = DBQueryResult<
  "tags",
  {
    with: {
      image: true;
      piecesToTags: {
        with: {
          piece: {
            with: {
              images: true;
              brand: true;
              size: true;
              category: true;
              discount: true;
            };
          };
        };
      };
    };
  }
>;

export function useHomeTags() {
  return useQuery({
    queryKey: ["home-tags"],
    queryFn: async () => {
      const response = await fetch("/api/tags");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return superjson.deserialize<HomeTag[]>(json);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
