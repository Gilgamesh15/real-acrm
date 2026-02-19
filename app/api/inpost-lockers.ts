import { inpostService } from "db/services/inpost.service";
import { data } from "react-router";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { logger } = context;

  const url = new URL(request.url);
  const latitudeParam = url.searchParams.get("latitude");
  const longitudeParam = url.searchParams.get("longitude");

  if (!latitudeParam || !longitudeParam) {
    logger.warn(
      "Missing latitude or longitude parameters for InPost lockers search",
      { latitude: latitudeParam, longitude: longitudeParam }
    );
    return data(
      {
        message: "Współrzędne geograficzne (latitude i longitude) są wymagane",
        lockers: [],
      },
      { status: 400 }
    );
  }

  const latitude = parseFloat(latitudeParam);
  const longitude = parseFloat(longitudeParam);

  if (isNaN(latitude) || isNaN(longitude)) {
    logger.warn(
      "Invalid latitude or longitude parameters for InPost lockers search",
      { latitude: latitudeParam, longitude: longitudeParam }
    );
    return data(
      {
        message: "Nieprawidłowe współrzędne geograficzne",
        lockers: [],
      },
      { status: 400 }
    );
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    logger.warn(
      "Out of range latitude or longitude parameters for InPost lockers search",
      { latitude, longitude }
    );
    return data(
      {
        message: "Współrzędne geograficzne poza zakresem",
        lockers: [],
      },
      { status: 400 }
    );
  }

  try {
    const result = await inpostService.getInpostLockers(latitude, longitude);
    return result;
  } catch (error) {
    logger.error("Failed to fetch InPost lockers", {
      error,
      latitude,
      longitude,
    });
    return data(
      {
        message: "Nie udało się pobrać listy paczkomatów",
        lockers: [],
      },
      { status: 500 }
    );
  }
}
