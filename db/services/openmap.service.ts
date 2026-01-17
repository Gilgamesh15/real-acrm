import { data } from "react-router";

import { type Logger } from "~/lib/logger.server";
import { logger } from "~/lib/logger.server";
import type { OpenStreetMapResult } from "~/lib/types";

class OpenMapService {
  constructor(private logger: Logger) {}

  private get headers() {
    return {
      "User-Agent": "ACRM-E-commerce/1.0", // OpenStreetMap requires a User-Agent
    };
  }

  // ========================== GEOCODING SEARCH ==========================
  async geocodingSearch(query: string) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=5&countrycodes=pl&accept-language=pl`,
        {
          headers: this.headers,
        }
      );

      if (!res.ok) {
        this.logger.error("OpenStreetMap API error", {
          status: res.status,
          statusText: res.statusText,
          query,
        });
        return data(
          {
            message: "Nie udało się wyszukać adresu",
            results: [],
          },
          { status: 400 }
        );
      }

      const results = (await res.json()).map(
        this.formatOpenStreetMapResult
      ) as OpenStreetMapResult[];

      return data(
        {
          message: "Adresy zostały pobrane pomyślnie",
          results,
        },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        this.logger.error("Request timeout", { error, query });
        return data(
          {
            message: "Przekroczono czas oczekiwania na odpowiedź",
            results: [],
          },
          { status: 408 }
        );
      }

      this.logger.error("Failed to fetch address suggestions", {
        error,
        query,
      });
      return data(
        {
          message: "Nie udało się wyszukać adresu",
          results: [],
        },
        { status: 500 }
      );
    }
  }

  // ========================== HELPER METHODS ==========================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private formatOpenStreetMapResult(data: any): OpenStreetMapResult {
    const addr = data.address;
    const components: string[] = [];

    if (addr.road) {
      const street =
        addr.road.startsWith("ul.") ||
        addr.road.startsWith("al.") ||
        addr.road.startsWith("pl.")
          ? addr.road
          : `ul. ${addr.road}`;
      components.push(street);
    }

    if (addr.neighbourhood) {
      components.push(addr.neighbourhood);
    } else if (addr.suburb) {
      components.push(addr.suburb);
    }

    if (addr.city) {
      components.push(addr.city);
    } else if (addr.municipality) {
      components.push(addr.municipality);
    }

    if (addr.postcode) {
      components.push(addr.postcode);
    }

    let label = "";
    if (components.length > 0) {
      const lastIndex = components.length - 1;
      const isLastPostcode =
        addr.postcode && components[lastIndex] === addr.postcode;

      if (isLastPostcode && components.length > 1) {
        label =
          components.slice(0, -1).join(", ") + " " + components[lastIndex];
      } else {
        label = components.join(", ");
      }
    }

    return {
      id: data.place_id,
      label: label || "Brak adresu",
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon),
    };
  }
}

const openMapService = new OpenMapService(
  logger.child({ service: "OpenMapService" })
);

export { openMapService, OpenMapService };
