import * as schema from "db/schema";
import { eq } from "drizzle-orm";
import { data } from "react-router";

import { db } from "~/lib/db";
import { type Logger } from "~/lib/logger.server";
import { logger } from "~/lib/logger.server";
import type { InpostApiLocker } from "~/lib/types";

const INPOST_API_KEY = import.meta.env.VITE_INPOST_API_KEY;
const INPOST_ENVIRONMENT = import.meta.env.VITE_INPOST_ENVIROMENT;

class InpostService {
  constructor(private logger: Logger) {}

  private get baseUrl() {
    return INPOST_ENVIRONMENT === "sandbox"
      ? "sandbox-api-gateway-pl.easypack24.net"
      : "api.inpost.pl";
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${INPOST_API_KEY}`,
    };
  }

  // ========================== GET DEFAULT LOCKER ==========================

  async getDefaultLocker(userId: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
        columns: {
          defaultLockerName: true,
        },
      });

      const defaultLockerName = user?.defaultLockerName;

      if (!defaultLockerName) {
        return data(
          {
            message: "Brak domyślnego paczkomatu",
            locker: null,
          },
          { status: 200 }
        );
      }

      const response = await fetch(
        `https://${this.baseUrl}/v1/points?name=${encodeURIComponent(
          defaultLockerName
        )}`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        this.logger.error("InPost API error for default locker", {
          status: response.status,
          statusText: response.statusText,
          lockerName: defaultLockerName,
          userId,
        });
        return data(
          {
            message: "Nie udało się pobrać domyślnego paczkomatu",
            locker: null,
          },
          { status: 400 }
        );
      }

      const responseData = await response.json();
      const [item] = responseData.items;

      if (!item) {
        this.logger.warn("Default locker not found", {
          lockerName: defaultLockerName,
          userId,
        });
        return data(
          {
            message: "Domyślny paczkomat nie został znaleziony",
            locker: null,
          },
          { status: 404 }
        );
      }

      const locker: InpostApiLocker = this.formatLocker(item);

      return data(
        {
          message: "Domyślny paczkomat został pobrany pomyślnie",
          locker,
        },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        this.logger.error("Request timeout", { error, userId });
        return data(
          {
            message: "Przekroczono czas oczekiwania na odpowiedź",
            locker: null,
          },
          { status: 408 }
        );
      }

      this.logger.error("Failed to fetch default locker", { error, userId });
      return data(
        {
          message: "Nie udało się pobrać domyślnego paczkomatu",
          locker: null,
        },
        { status: 500 }
      );
    }
  }

  // ========================== GET INPOST LOCKERS ==========================

  async getInpostLockers(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `https://${this.baseUrl}/v1/points?relative_point=${latitude},${longitude}&max_distance=50000&per_page=500&functions=parcel_collect&status=Operating`,
        {
          headers: this.headers,
        }
      );

      if (!response.ok) {
        this.logger.error("InPost API error for lockers search", {
          status: response.status,
          statusText: response.statusText,
          latitude,
          longitude,
        });
        return data(
          {
            message: "Nie udało się pobrać listy paczkomatów",
            lockers: [],
          },
          { status: 400 }
        );
      }

      const responseData = await response.json();

      if (!responseData.items || !Array.isArray(responseData.items)) {
        this.logger.error("Invalid response from InPost API", {
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

      const formattedData: InpostApiLocker[] = responseData.items.map(
        this.formatLocker
      );
      return data(
        {
          message: "Lista paczkomatów została pobrana pomyślnie",
          lockers: formattedData,
        },
        { status: 200 }
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        this.logger.error("Request timeout", { error, latitude, longitude });
        return data(
          {
            message: "Przekroczono czas oczekiwania na odpowiedź",
            lockers: [],
          },
          { status: 408 }
        );
      }

      this.logger.error("Failed to fetch InPost lockers", {
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

  // ========================== SET DEFAULT LOCKER ==========================

  async setDefaultLocker(userId: string, lockerName: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(schema.users.id, userId),
        columns: {
          defaultLockerName: true,
        },
      });

      if (!user) {
        this.logger.warn("User not found for setDefaultLocker", { userId });
        return data(
          {
            message: "Użytkownik nie został znaleziony",
            locker: null,
          },
          { status: 404 }
        );
      }

      if (user.defaultLockerName === lockerName) {
        return data(
          {
            message: "Domyślny paczkomat jest już ustawiony",
            locker: null,
          },
          { status: 200 }
        );
      }

      await db
        .update(schema.users)
        .set({ defaultLockerName: lockerName })
        .where(eq(schema.users.id, userId));

      this.logger.info("User set default locker", { userId, lockerName });

      return data(
        {
          message: "Domyślny paczkomat został ustawiony pomyślnie",
          locker: lockerName,
        },
        { status: 200 }
      );
    } catch (error) {
      this.logger.error("Failed to set default locker", {
        error,
        userId,
        lockerName,
      });
      return data(
        {
          message: "Nie udało się ustawić domyślnego paczkomatu",
          locker: null,
        },
        { status: 500 }
      );
    }
  }

  private formatLocker(locker: any) {
    return {
      name: locker.name,
      location: {
        latitude: locker.location.latitude,
        longitude: locker.location.longitude,
      },
      address: {
        line1: locker.address.line1,
        line2: locker.address.line2,
      },
      address_details: {
        city: locker.address_details.city,
        post_code: locker.address_details.post_code,
        street: locker.address_details.street,
        building_number: locker.address_details.building_number,
      },
      image_url: locker.image_url,
      opening_hours: locker.opening_hours,
      location_description: locker.location_description,
      operating_hours_extended: locker.operating_hours_extended,
    };
  }
}

const inpostService = new InpostService(
  logger.child({ service: "InpostService" })
);

export { inpostService, InpostService };
