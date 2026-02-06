import { useQuery } from "@tanstack/react-query";
import React from "react";

import type { loader as inpostLockersLoader } from "~/api/inpost-lockers";
import { useDebounceValue } from "~/hooks/use-debounce-value";
import type { Coordinate } from "~/lib/types";
import type { InpostApiLocker } from "~/lib/types";

type LockersContextType = {
  lockers: InpostApiLocker[];
  isLoading: boolean;
  error?: string;
  coordinates?: Coordinate;
  setCoordinates: (coordinates: Coordinate) => void;
};

const LockersContext = React.createContext<LockersContextType | null>(null);

const useLockers = () => {
  const context = React.useContext(LockersContext);
  if (!context) {
    throw new Error("useLockers must be used within a LockersProvider");
  }
  return context;
};

function LockersProvider({ children }: { children: React.ReactNode }) {
  const [coordinates, setCoordinates] = React.useState<Coordinate | undefined>(
    undefined
  );
  const [debouncedCoordinates] = useDebounceValue<Coordinate | undefined>(
    coordinates,
    2000,
    {
      leading: true,
      trailing: false,
    }
  );

  const {
    data: lockers = [],
    isLoading: _isLoading,
    isRefetching,
    error,
  } = useQuery({
    queryKey: [
      "inpost-lockers",
      debouncedCoordinates?.latitude,
      debouncedCoordinates?.longitude,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        latitude: debouncedCoordinates?.latitude.toString() ?? "50.0647",
        longitude: debouncedCoordinates?.longitude.toString() ?? "19.945",
      });

      const response = await fetch(`/api/inpost-lockers?${params}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = (await response.json()) as Awaited<
        ReturnType<typeof inpostLockersLoader>
      >["data"];
      return data.lockers || [];
    },
    enabled:
      Boolean(debouncedCoordinates) &&
      debouncedCoordinates!.latitude !== undefined &&
      debouncedCoordinates!.longitude !== undefined,
  });

  const isLoading = _isLoading || isRefetching;

  return (
    <LockersContext.Provider
      value={{
        lockers,
        isLoading,
        error: error?.message,
        coordinates,
        setCoordinates,
      }}
    >
      {children}
    </LockersContext.Provider>
  );
}

export { LockersProvider, LockersContext, useLockers };
