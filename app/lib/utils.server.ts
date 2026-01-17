import { createSearchParamsCache } from "nuqs/server";

import { getFilterSearchParams } from "./utils";

export const filterSearchParamsCache = createSearchParamsCache(
  getFilterSearchParams({ priceMin: 0, priceMax: 100000 })
);
