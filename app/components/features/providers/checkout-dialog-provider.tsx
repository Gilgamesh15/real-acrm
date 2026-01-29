import { useQuery } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import React, { lazy, useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Spinner } from "~/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import type { CartPiece } from "~/api/cart";
import type { CartProduct } from "~/api/cart";
import { useGeolocation } from "~/hooks/use-geolocation";
import { useIsMobile } from "~/hooks/use-mobile";
import { authClient } from "~/lib/auth-client";
import type { InpostApiLocker } from "~/lib/types";

import { LockerDetails } from "../locker-picker/locker-details";
import { LockerInfo } from "../locker-picker/locker-info";
import { LockerList } from "../locker-picker/locker-list";
import { LockersProvider, useLockers } from "../locker-picker/lockers-provider";
import { OpenMapProvider, useOpenMap } from "../locker-picker/openmap-provider";
import { SearchBar } from "../locker-picker/search-bar";
import { useCart } from "./cart-provider";
import { useCheckout } from "./checkout-provider";
import HomeDeliveryHero from "/home-delivery-hero.png";
import ParcelLockerDeliveryHero from "/parcel-locker-delivery-hero.png";

const LockerPickerMap = lazy(() =>
  import("../locker-picker/locker-picker-map.client").then((m) => ({
    default: m.LockerPickerMap,
  }))
);

type CheckoutDialogContextType = {
  goToCheckout: () => void;
  onPieceBuyNow: (piece: CartPiece) => void;
  onProductBuyNow: (product: CartProduct) => void;
};

const CheckoutDialogContext =
  React.createContext<CheckoutDialogContextType | null>(null);

function useCheckoutDialog() {
  const context = React.useContext(CheckoutDialogContext);
  if (!context) {
    throw new Error(
      "useCheckoutDialog must be used within a CheckoutDialogProvider"
    );
  }
  return context;
}

function CheckoutDialogProvider({ children }: React.PropsWithChildren) {
  const [open, setOpen] = React.useState(false);
  const { initiateCheckout } = useCheckout();

  const { items, addPiece, addProduct } = useCart();

  // Transform cart items to CreateOrderSchema pieces format
  const pieces = React.useMemo(() => {
    const result: Array<{ id: string; productId?: string }> = [];

    // Add pieces from products (with productId reference)
    for (const product of items.products) {
      for (const piece of product.pieces) {
        result.push({ id: piece.id, productId: product.id });
      }
    }

    // Add standalone pieces (no productId)
    for (const piece of items.pieces) {
      result.push({ id: piece.id });
    }

    return result;
  }, [items]);

  const [tab, setTab] = useState<"method-selection" | "locker-selection">(
    "method-selection"
  );
  const [saveLocker, setSaveLocker] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState<
    InpostApiLocker | undefined
  >(undefined);

  const session = authClient.useSession.get();

  const isLoggedIn =
    !!session && !session.isPending && !session.data?.user.isAnonymous;

  // Fetch default locker for logged-in users
  const { data: defaultLocker, isLoading: isDefaultLockerLoading } = useQuery({
    queryKey: ["default-locker", session?.data?.user?.id],
    queryFn: async () => {
      const response = await fetch("/api/default-locker");
      if (!response.ok) {
        throw new Error("Failed to fetch default locker");
      }
      const data = await response.json();
      return data.locker as InpostApiLocker | undefined;
    },
    enabled: isLoggedIn,
  });

  const onCourierClick = React.useCallback(() => {
    //window.gtag?.("event", "add_shipping_info", {
    //  currency: "PLN",
    //  value: totalCartValue,
    //  shipping_tier: "courier",
    //  items: [
    //    ...items.products.flatMap((product) => {
    //      const skewPercent = product.pricePercentageSkew;
    //      return product.pieces.map((piece) => ({
    //        item_id: piece.id,
    //        item_name: piece.name,
    //        item_brand: piece.brand.name,
    //        item_category: piece.category?.name,
    //        price: priceFromGrosz(
    //          Math.round((piece.priceInGrosz * (100 - skewPercent)) / 100)
    //        ),
    //      }));
    //    }),
    //    ...items.pieces.map((piece) => ({
    //      item_id: piece.id,
    //      item_name: piece.name,
    //      item_brand: piece.brand.name,
    //      item_category: piece.category?.name,
    //      price: priceFromGrosz(piece.priceInGrosz),
    //    })),
    //  ],
    //});

    initiateCheckout({
      pieces,
      deliveryMethod: "courier",
    });
  }, [
    initiateCheckout,
    pieces,
    //items
  ]);

  const onLockerClick = React.useCallback(() => {
    setTab("locker-selection");
    setSaveLocker(false);
    setSelectedLocker(undefined);
  }, []);

  const onBackToMethodSelection = React.useCallback(() => {
    setTab("method-selection");
    setSaveLocker(false);
    setSelectedLocker(undefined);
  }, []);

  const onProceedToCheckout = React.useCallback(() => {
    if (!selectedLocker) {
      console.error("No locker selected");
      return;
    }

    //const totalCartValue =
    //  items.products.reduce(
    //    (sum, product) =>
    //      sum +
    //      product.pieces.reduce(
    //        (pSum, piece) => pSum + priceFromGrosz(piece.priceInGrosz),
    //        0
    //      ),
    //    0
    //  ) +
    //  items.pieces.reduce(
    //    (sum, piece) => sum + priceFromGrosz(piece.priceInGrosz),
    //    0
    //  );
    //
    //gtag.event.emit("add_shipping_info", {
    //  currency: "PLN",
    //  value: totalCartValue,
    //  shipping_tier: "locker",
    //});

    initiateCheckout({
      pieces,
      deliveryMethod: "locker",
      lockerCode: selectedLocker.name,
      saveLocker,
    });
  }, [
    initiateCheckout,
    pieces,
    selectedLocker,
    saveLocker,
    //items
  ]);

  const goToCheckout = React.useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const onPieceBuyNow = React.useCallback(
    (piece: CartPiece) => {
      addPiece(piece);
      goToCheckout();
    },
    [addPiece, goToCheckout]
  );

  const onProductBuyNow = React.useCallback(
    (product: CartProduct) => {
      addProduct(product);
      goToCheckout();
    },
    [addProduct, goToCheckout]
  );

  return (
    <CheckoutDialogContext.Provider
      value={{ goToCheckout, onPieceBuyNow, onProductBuyNow }}
    >
      {children}

      <Dialog open={open} onOpenChange={setOpen}>
        {tab === "method-selection" && (
          <MethodSelectionDialogContent
            onLockerClick={onLockerClick}
            onCourierClick={onCourierClick}
          />
        )}
        {tab === "locker-selection" &&
          (isDefaultLockerLoading ? (
            <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Ładowanie...</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center p-8">
                <Spinner className="size-8" />
              </div>
            </DialogContent>
          ) : selectedLocker ? (
            <DialogContent showCloseButton={false}>
              <DialogHeader className="px-2 py-2 flex flex-row items-center">
                <div className="flex-1 flex items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onBackToMethodSelection();
                    }}
                  >
                    <ChevronLeftIcon />
                  </Button>
                </div>
                <DialogTitle className="text-center">
                  Wybierz punkt odbioru
                </DialogTitle>

                <div className="flex-1 flex justify-end">
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" size="icon">
                      <XIcon />
                    </Button>
                  </DialogClose>
                </div>
              </DialogHeader>

              <Button
                type="button"
                className="relative p-4 h-auto w-full justify-between items-start whitespace-normal"
                variant="outline"
                onClick={() => {
                  setTab("locker-selection");
                  setSelectedLocker(undefined);
                  setSaveLocker(false);
                }}
              >
                <LockerInfo locker={selectedLocker} />
                <EditIcon />
              </Button>

              {isLoggedIn && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="save-locker-mobile"
                    checked={saveLocker}
                    onCheckedChange={(checked) =>
                      setSaveLocker(checked === true)
                    }
                  />
                  <Label
                    htmlFor="save-locker-mobile"
                    className="text-sm cursor-pointer"
                  >
                    Zapisz jako domyślny punkt odbioru
                  </Label>
                </div>
              )}

              <DialogFooter>
                <Button onClick={onProceedToCheckout}>Potwierdź</Button>
              </DialogFooter>
            </DialogContent>
          ) : (
            <LockersProvider>
              <OpenMapProvider>
                <LockerPickerDialogContent
                  onBack={onBackToMethodSelection}
                  selectedLocker={selectedLocker}
                  onSelectedLockerChange={setSelectedLocker}
                  defaultLocker={defaultLocker}
                />
              </OpenMapProvider>
            </LockersProvider>
          ))}
      </Dialog>
    </CheckoutDialogContext.Provider>
  );
}

function LockerPickerDialogContent({
  onBack,
  selectedLocker,
  onSelectedLockerChange,
  defaultLocker,
}: {
  // default locker
  defaultLocker?: InpostApiLocker;

  // core
  selectedLocker: InpostApiLocker | undefined;
  onSelectedLockerChange: (locker: InpostApiLocker) => void;

  // navigation actions
  onBack: () => void;
}) {
  const isMobile = useIsMobile();
  const [activeLocker, setActiveLocker] = React.useState<
    InpostApiLocker | undefined
  >(undefined);
  const [tab, setTab] = React.useState<"map" | "search">("search");
  const [isViewingDetails, setIsViewingDetails] = React.useState(false);

  const {
    lockers,
    isLoading: isLockersLoading,
    error: lockersError,
    coordinates: lockerSearchCoordinates,
    setCoordinates: setLockerSearchCoordinates,
  } = useLockers();

  // Add default locker to the beginning of the list if it exists
  const lockersWithDefault = React.useMemo(() => {
    if (defaultLocker && !lockers.find((l) => l.name === defaultLocker.name)) {
      return [defaultLocker, ...lockers];
    }
    return lockers;
  }, [lockers, defaultLocker]);

  const {
    search,
    onSearchChange,
    locations: openMapLocations,
    isLoading: isOpenMapLoading,
    error: openMapError,
  } = useOpenMap();

  const { loading: isGeolocationLoading, getCurrentPosition } = useGeolocation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: (position) => {
      setLockerSearchCoordinates({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setTab("map");
    },
  });

  return (
    <DialogContent
      showCloseButton={false}
      className="w-[calc(100%-2rem)] sm:max-w-7xl gap-0 flex flex-col p-0 h-[80vh] overflow-hidden"
    >
      <DialogHeader className="px-2 py-2 flex flex-row items-center">
        <div className="flex-1 flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (activeLocker) {
                setActiveLocker(undefined);
                setIsViewingDetails(false);
              } else {
                onBack();
              }
            }}
          >
            <ChevronLeftIcon />
          </Button>
        </div>
        <DialogTitle className="text-center">Wybierz punkt odbioru</DialogTitle>

        <div className="flex-1 flex justify-end">
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon">
              <XIcon />
            </Button>
          </DialogClose>
        </div>
      </DialogHeader>

      {isMobile && (
        <div className="flex-1 h-full">
          {isViewingDetails && activeLocker ? (
            <div className="flex flex-col gap-2 h-full p-4">
              <LockerInfo locker={activeLocker} />
              <LockerDetails locker={activeLocker} />

              <div className="flex-1" />

              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={() => {
                    onSelectedLockerChange(activeLocker);
                    setActiveLocker(undefined);
                    setIsViewingDetails(false);
                  }}
                  className="w-full"
                >
                  Potwierdź
                </Button>
              </div>
            </div>
          ) : tab === "search" ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-8 px-4">
                <p className="text-center text-lg font-semibold">
                  Wyszukaj punkty odbioru w okolicy
                </p>
                <SearchBar
                  value={search}
                  onValueChange={onSearchChange}
                  entries={openMapLocations.map((location) => ({
                    label: location.label,
                    value: `${location.latitude},${location.longitude}`,
                  }))}
                  isLoading={isOpenMapLoading}
                  error={openMapError}
                  onSelect={(entry) => {
                    setLockerSearchCoordinates({
                      latitude: parseFloat(entry.value.split(",")[0]),
                      longitude: parseFloat(entry.value.split(",")[1]),
                    });
                    setTab("map");
                  }}
                  className="min-w-full"
                />
                <p className="text-center text-muted-foreground text-xs">lub</p>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-3/4"
                  onClick={getCurrentPosition}
                  disabled={isGeolocationLoading}
                >
                  {isGeolocationLoading ? (
                    <Spinner className="size-4 mr-2" />
                  ) : (
                    <>
                      <SendIcon className="size-4 mr-2" />
                      Użyj mojej lokalizacji
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : tab === "map" ? (
            <div className="flex flex-col h-full">
              <div className="p-2">
                <SearchBar
                  value={search}
                  onValueChange={onSearchChange}
                  entries={openMapLocations.map((location) => ({
                    label: location.label,
                    value: `${location.latitude},${location.longitude}`,
                  }))}
                  isLoading={isOpenMapLoading}
                  error={openMapError}
                  onSelect={(entry) => {
                    setLockerSearchCoordinates({
                      latitude: parseFloat(entry.value.split(",")[0]),
                      longitude: parseFloat(entry.value.split(",")[1]),
                    });
                    setTab("map");
                  }}
                  className="min-w-full"
                />
              </div>
              <Tabs defaultValue="map" className="flex flex-col flex-1 h-full">
                <TabsList className="w-full">
                  <TabsTrigger value="map">Mapa</TabsTrigger>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                </TabsList>
                <TabsContent
                  value="map"
                  className="flex flex-col flex-1 h-full"
                >
                  <LockerPickerMap
                    className="h-full flex-1"
                    isLoading={isLockersLoading}
                    error={lockersError}
                    lockers={lockersWithDefault}
                    center={lockerSearchCoordinates}
                    selectedLocker={selectedLocker}
                    onSelectedLockerChange={(locker) => {
                      setActiveLocker(locker);
                      setIsViewingDetails(true);
                    }}
                    activeLocker={activeLocker}
                    onActiveLockerChange={(locker) => {
                      setActiveLocker(locker);
                    }}
                    onSearchInpostLockers={setLockerSearchCoordinates}
                    defaultLocker={defaultLocker}
                  />
                  {activeLocker && (
                    <div className="space-y-2 p-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="relative h-auto w-full justify-between p-4"
                        onClick={() => {
                          setIsViewingDetails(true);
                        }}
                      >
                        <LockerInfo locker={activeLocker} />
                        <ChevronRightIcon className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        onClick={() => {
                          onSelectedLockerChange(activeLocker);
                          setActiveLocker(undefined);
                          setIsViewingDetails(false);
                        }}
                        className="w-full"
                      >
                        Potwierdź
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="list" className="h-full flex flex-col">
                  <LockerList
                    lockers={lockersWithDefault}
                    isLoading={isLockersLoading}
                    error={lockersError}
                    onLockerClick={(locker) => {
                      setActiveLocker(locker);
                      setIsViewingDetails(true);
                    }}
                    selectedLocker={activeLocker}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </div>
      )}

      {!isMobile && (
        <div>
          <Separator />

          <div className="flex-1 h-full w-full flex">
            <LockerList
              className="w-[300px] h-[calc(80vh-50px)]"
              lockers={lockersWithDefault}
              isLoading={isLockersLoading}
              error={lockersError}
              onLockerClick={(locker) => {
                setActiveLocker(locker);
                setIsViewingDetails(true);
              }}
              selectedLocker={activeLocker}
            />
            <Separator orientation="vertical" />
            <div className="flex flex-col flex-1 min-h-full">
              <div className="p-2">
                <SearchBar
                  className="min-w-full"
                  value={search}
                  onValueChange={onSearchChange}
                  entries={openMapLocations.map((location) => ({
                    label: location.label,
                    value: `${location.latitude},${location.longitude}`,
                  }))}
                  isLoading={isOpenMapLoading}
                  error={openMapError}
                  onSelect={(entry) => {
                    setLockerSearchCoordinates({
                      latitude: parseFloat(entry.value.split(",")[0]),
                      longitude: parseFloat(entry.value.split(",")[1]),
                    });
                    setTab("map");
                  }}
                />
              </div>
              <LockerPickerMap
                className="h-full flex-1"
                isLoading={isLockersLoading}
                error={lockersError}
                lockers={lockersWithDefault}
                center={lockerSearchCoordinates}
                selectedLocker={selectedLocker}
                onSelectedLockerChange={(locker) => {
                  setActiveLocker(locker);
                  setIsViewingDetails(true);
                }}
                onSearchInpostLockers={setLockerSearchCoordinates}
                defaultLocker={defaultLocker}
                activeLocker={activeLocker}
                onActiveLockerChange={(locker) => {
                  setActiveLocker(locker);
                }}
              />
              {activeLocker && (
                <Collapsible>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center p-4">
                      <LockerInfo locker={activeLocker} />
                      <Button
                        type="button"
                        className="ml-auto"
                        onClick={() => {
                          onSelectedLockerChange(activeLocker);
                          setActiveLocker(undefined);
                          setIsViewingDetails(false);
                        }}
                      >
                        Potwierdź
                      </Button>
                    </div>

                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-between"
                      >
                        Więcej informacji
                        <ChevronDownIcon className="size-4 group-data-[state=open]:rotate-180 transition-transform duration-200" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className="h-48 overflow-y-auto">
                    <LockerDetails locker={activeLocker} />
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
}

function MethodSelectionDialogContent({
  onCourierClick,
  onLockerClick,
}: {
  onLockerClick: () => void;
  onCourierClick: () => void;
}) {
  return (
    <DialogContent
      showCloseButton={false}
      className="w-[calc(100%-2rem)] sm:max-w-7xl gap-0 flex flex-col p-0 overflow-hidden"
    >
      <DialogHeader className="px-2 py-2 flex flex-row items-center">
        <div className="flex-1" />
        <DialogTitle className="text-center">
          Wybierz metodę dostawy
        </DialogTitle>

        <div className="flex-1 flex justify-end">
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon">
              <XIcon />
            </Button>
          </DialogClose>
        </div>
      </DialogHeader>

      <div className="flex flex-col md:flex-row gap-4 items-stretch font-secondary flex-1 h-full p-4">
        <Button
          onClick={onLockerClick}
          variant="outline"
          className="relative p-px group h-[200px] md:h-[300px] md:w-1/2 flex flex-col w-full"
        >
          <img
            src={ParcelLockerDeliveryHero}
            alt="Inpost Hero"
            className="object-cover size-full opacity-70 group-hover:opacity-100 transition-opacity z-0"
          />
          <div className="absolute inset-0 bg-linear-gradient-to-tr from-background/50 via-transparent to-transparent transition-opacity z-10" />
          <div className="flex flex-col text-left gap-4 absolute bottom-2 left-2 z-20">
            <div>
              <h3 className="text-xl font-semibold mb-2">Paczkomat</h3>
              <p className="text-sm text-muted-foreground">
                Odbierz w najbliższych paczkomatach inpost
              </p>
            </div>
          </div>
        </Button>
        <Button
          onClick={onCourierClick}
          variant="outline"
          className="relative p-px group h-[200px] md:h-[300px] md:w-1/2 flex flex-col w-full"
        >
          <img
            src={HomeDeliveryHero}
            alt="Home Delivery Hero"
            className="object-cover size-full opacity-70 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-linear-gradient-to-tr from-background/50 via-transparent to-transparent transition-opacity z-10" />
          <div className="flex flex-col text-left gap-4 absolute bottom-2 left-2 z-20">
            <div>
              <h3 className="text-xl font-semibold mb-2">Dostawa kurierem</h3>
              <p className="text-sm text-muted-foreground">
                Dostawa bezpośrednio do twojego adresu
              </p>
            </div>
          </div>
        </Button>
      </div>
    </DialogContent>
  );
}

export { CheckoutDialogProvider, useCheckoutDialog };
