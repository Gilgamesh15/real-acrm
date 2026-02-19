import { openMapService } from "db/services/openmap.service";
import { data } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { logger } = context;

  const url = new URL(request.url);
  const query = url.searchParams.get("search");

  if (!query || query.trim().length === 0) {
    logger.warn("Missing or empty search query for OpenMap search", { query });
    return data(
      {
        message: "Zapytanie wyszukiwania jest wymagane",
        results: [],
      },
      { status: 400 }
    );
  }

  try {
    const result = await openMapService.geocodingSearch(query.trim());
    return result;
  } catch (error) {
    logger.error("Failed to search addresses via OpenMap", { error, query });
    return data(
      {
        message: "Nie udało się wyszukać adresów",
        results: [],
      },
      { status: 500 }
    );
  }
}
