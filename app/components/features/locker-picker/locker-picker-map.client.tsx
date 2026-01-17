import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, Minus, Plus, Send } from "lucide-react";
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { Popup } from "react-leaflet";
import { Marker } from "react-leaflet";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";

import { useGeolocation } from "~/hooks/use-geolocation";
import type { Coordinate, Coordinates, InpostApiLocker } from "~/lib/types";
import { cn } from "~/lib/utils";

const MAPBOX_ENVIRONMENT = import.meta.env.VITE_MAPBOX_ENVIRONMENT;
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

export function LockerPickerMap({
  className,
  lockers,
  isLoading,
  // TODO find a use for this
  //error,
  selectedLocker,
  defaultLocker,
  center = {
    latitude: 50.061981,
    longitude: 19.936558,
  },
  onSelectedLockerChange,
  onSearchInpostLockers,
  activeLocker,
  onActiveLockerChange,
}: {
  className?: string;
  lockers: InpostApiLocker[];
  isLoading: boolean;
  error?: string;
  defaultLocker?: InpostApiLocker;
  center?: Coordinate;
  selectedLocker?: InpostApiLocker;
  onSelectedLockerChange: (locker: InpostApiLocker) => void;
  onSearchInpostLockers: (coords: Coordinates) => void;
  activeLocker?: InpostApiLocker;
  onActiveLockerChange: (locker: InpostApiLocker) => void;
}) {
  const mapRef = React.useRef<L.Map | null>(null);

  const { loading: isLocating, getCurrentPosition } = useGeolocation({
    onSuccess: (position) => {
      onSearchInpostLockers({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      if (mapRef.current) {
        mapRef.current.setView(
          [position.coords.latitude, position.coords.longitude],
          13
        );
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLocateSearchClick = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      onSearchInpostLockers({
        latitude: center.lat,
        longitude: center.lng,
      });
    }
  };

  React.useEffect(() => {
    if (center) {
      const map = mapRef.current;
      if (!map) return;

      map.setView([center.latitude, center.longitude], map.getZoom() || 13, {
        animate: true,
      });
    }
  }, [center]);

  return (
    <>
      <style>
        {`
        .leaflet-popup-content-wrapper {
          border-radius: 0px;
          padding: 4px;
          width: auto;
          background: #1a1a1a;
        }
        .leaflet-popup-content {
          margin: 12px;
          color: white;
        }
        .leaflet-popup-content p {
          margin: 0 16px 0 0;
        }
        .no-wrap-popup .leaflet-popup-content-wrapper {
          width: max-content !important;
          min-width: auto !important;
        }
        .no-wrap-popup .leaflet-popup-content {
          width: max-content !important;
          white-space: nowrap !important;
        }
        `}
      </style>
      <MapContainer
        className={cn("relative", className)}
        ref={mapRef}
        center={[center.latitude, center.longitude]}
        zoom={13}
        zoomControl={false}
      >
        <div className="absolute top-0 left-0 z-1000 p-2 flex flex-col gap-2">
          <div className="flex flex-col">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => {
                mapRef.current?.zoomIn();
              }}
            >
              <Plus />
            </Button>
            <Separator />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => {
                mapRef.current?.zoomOut();
              }}
            >
              <Minus />
            </Button>
          </div>
          <Button
            size="icon"
            type="button"
            variant="secondary"
            onClick={getCurrentPosition}
            disabled={isLocating}
          >
            {isLocating ? <Spinner /> : <Send />}
          </Button>
        </div>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={
            MAPBOX_ENVIRONMENT === "production"
              ? `https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=${MAPBOX_API_KEY}`
              : "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png"
          }
        />

        <Button
          type="button"
          variant="secondary"
          className="absolute top-2 left-1/2 -translate-x-1/2 z-1000"
          onClick={handleLocateSearchClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Szukaj w tej okolicy"
          )}
        </Button>

        {lockers.map((locker) => (
          <InpostMarker
            key={locker.name}
            locker={locker}
            isActive={activeLocker?.name === locker.name}
            onActiveChange={() => onActiveLockerChange(locker)}
            isSelected={selectedLocker?.name === locker.name}
            isDefault={defaultLocker?.name === locker.name}
            popup={
              <InPostMarkerPopup
                locker={locker}
                isSelected={selectedLocker?.name === locker.name}
                onSelect={() => onSelectedLockerChange(locker)}
              />
            }
          />
        ))}
      </MapContainer>
    </>
  );
}

const InPostMarkerPopup = ({
  locker,
  isSelected = false,
  onSelect,
}: {
  locker: InpostApiLocker;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const { image_url, name, address, address_details } = locker;

  return (
    <Popup
      minWidth={0}
      maxWidth={500}
      closeButton={true}
      autoClose={false}
      className="no-wrap-popup"
    >
      <div className="rounded-md flex gap-3 items-start whitespace-nowrap bg-muted p-3 text-white">
        <img
          src={image_url}
          alt=""
          className="size-12 border border-primary/50 aspect-square shrink-0"
        />
        <div className="flex flex-col p-0 m-0 whitespace-nowrap">
          <p className="whitespace-nowrap font-semibold">{name}</p>
          <p className="whitespace-nowrap text-muted-foreground text-sm">
            {address.line1}
          </p>
          <p className="whitespace-nowrap text-muted-foreground text-sm">
            {address_details.post_code}, {address_details.city}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="default"
            className="flex-1"
            disabled={isSelected}
            onClick={onSelect}
          >
            {isSelected ? "Wybrano" : "Wybierz"}
          </Button>
        </div>
      </div>
    </Popup>
  );
};

function InpostMarker({
  locker,
  isActive = false,
  onActiveChange,
  isSelected = false,
  isDefault = false,
  popup,
}: {
  locker: InpostApiLocker;

  isActive: boolean;
  onActiveChange: () => void;

  isSelected: boolean;
  isDefault: boolean;
  popup: React.ReactNode;
}) {
  const iconState = isSelected ? "selected" : isActive ? "active" : "default";
  return (
    <Marker
      icon={getIcon(iconState, isDefault)}
      position={[locker.location.latitude, locker.location.longitude]}
      eventHandlers={{
        click: () => {
          onActiveChange();
        },
      }}
    >
      {popup}
    </Marker>
  );
}

const getIcon = (
  variant: "default" | "active" | "selected",
  isDefault: boolean
) => {
  return L.divIcon({
    html: `
    <div class="relative size-[32px]">
      <svg
        class="absolute inset-0 size-full"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 82 96"
        fill="${
          variant === "active"
            ? "#505050"
            : variant === "selected"
              ? "white"
              : "black"
        }"
      >
        <path
          d="M32 0H32C13.82 0 .23 13.62.23 31.74V49.86a32.77 32.77 0 003.35 14.67 29.85 29.85 0 007.71 9.81l3.22 2.34L41 96 67.49 76.68l3.22-2.34a29.85 29.85 0 007.71-9.81 32.77 32.77 0 003.35-14.67V32C81.77 13.62 68.18 0 50.06 0Z"
          fill="${
            variant === "active"
              ? "#505050"
              : variant === "selected"
                ? "white"
                : "black"
          }"
      >
        <path
          d="M32 0H32C13.82 0 .23 13.62.23 31.74V49.86a32.77 32.77 0 003.35 14.67 29.85 29.85 0 007.71 9.81l3.22 2.34L41 96 67.49 76.68l3.22-2.34a29.85 29.85 0 007.71-9.81 32.77 32.77 0 003.35-14.67V32C81.77 13.62 68.18 0 50.06 0Z"
          fill="${
            variant === "active"
              ? "#505050"
              : variant === "selected"
                ? "white"
                : "black"
          }"
          stroke="black"
          stroke-width="3"
          stroke-linejoin="round"
        />
      </svg>
      ${
        isDefault
          ? `<svg 
        class="absolute size-5 top-0.5 right-0.5 -translate-y-1/2 translate-x-1/2 z-1002 rounded-full bg-amber-400/90"
        xmlns="http://www.w3.org/2000/svg" 
        fill="black" 
        width="800px" 
        height="800px" 
        viewBox="0 0 24 24"
      >
        <path 
          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"
          class="opacity-75"
        />
      </svg>`
          : ""
      }
      <img
        alt=""
        class="object-cover size-full absolute -top-0.5 left-1/2 -translate-x-1/2 z-1001 scale-[0.6]"
        src="/InPost_logotype_2024_${
          variant === "selected" ? "white" : "black"
        }_bg.svg"
      />
    </div>
  `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};
