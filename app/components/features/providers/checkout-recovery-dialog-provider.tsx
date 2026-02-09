import React from "react";
import { useLocation } from "react-router";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import {
  calculatePiecePriceDisplayData,
  calculateProductPriceDisplayData,
} from "~/lib/utils";

import {
  ProductCardContent,
  ProductCardCountdown,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPieces,
  ProductCardPrice,
  ProductCardRoot,
} from "../product-card/product-card-primitives";
import { useCheckout } from "./checkout-provider";

const INACTIVITY_TIMEOUT = 12000; // 12 seconds

function CheckoutRecoveryDialogProvider({ children }: React.PropsWithChildren) {
  const location = useLocation();
  const { hasPendingOrder, items, resumeCheckout, cancelOrder, isLoading } =
    useCheckout();

  const [showDialog, setShowDialog] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Reset dismissed state on route change
  React.useEffect(() => {
    setDismissed(false);
    setShowDialog(false);
  }, [location.pathname]);

  // Track user activity
  const resetTimer = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (hasPendingOrder && !dismissed && !isLoading) {
      timeoutRef.current = setTimeout(() => {
        setShowDialog(true);
      }, INACTIVITY_TIMEOUT);
    }
  }, [hasPendingOrder, dismissed, isLoading]);

  // Setup activity listeners
  React.useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initial timer
    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);

  const handleResume = () => {
    setShowDialog(false);
    setDismissed(true);
    resumeCheckout();
  };

  const handleCancel = async () => {
    setShowDialog(false);
    setDismissed(true);
    await cancelOrder();
  };

  const totalItems = items.products.length + items.pieces.length;

  return (
    <>
      {children}

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Masz niedokonczone zamowienie</AlertDialogTitle>
            <AlertDialogDescription>
              Masz {totalItems}{" "}
              {totalItems === 1
                ? "produkt"
                : totalItems < 5
                  ? "produkty"
                  : "produktow"}{" "}
              w koszyku oczekujacych na platnosc. Czy chcesz kontynuowac zakupy?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Display items preview */}
          <div className="h-full overflow-auto p-3">
            <ul className="space-y-4">
              {items.products.map((product) => {
                const [primaryImage] = product.images;

                return (
                  <li key={product.id}>
                    <ProductCardRoot>
                      <ProductCardMedia>
                        <ProductCardImage
                          url={primaryImage?.url || ""}
                          alt={primaryImage?.alt || ""}
                        />
                      </ProductCardMedia>
                      <ProductCardContent>
                        <ProductCardInfo name={product.name} />
                        <ProductCardPrice
                          pricing={calculateProductPriceDisplayData(product)}
                        />
                      </ProductCardContent>

                      <ProductCardPieces>
                        {items.pieces.map((piece) => {
                          const [primaryImage] = piece.images;
                          return (
                            <ProductCardRoot key={piece.id} size="sm">
                              {piece.reservedUntil && (
                                <ProductCardCountdown
                                  expiresAt={piece.reservedUntil}
                                />
                              )}
                              <ProductCardMedia size="sm">
                                <ProductCardImage
                                  size="sm"
                                  url={primaryImage?.url || ""}
                                  alt={primaryImage?.alt || ""}
                                />
                              </ProductCardMedia>
                              <ProductCardContent>
                                <ProductCardInfo
                                  name={piece.name}
                                  textSize="sm"
                                  brand={piece.brand.name}
                                  size={piece.size.name}
                                />
                              </ProductCardContent>
                            </ProductCardRoot>
                          );
                        })}
                      </ProductCardPieces>
                    </ProductCardRoot>
                  </li>
                );
              })}
            </ul>
            <ul className="space-y-4">
              {items.pieces.map((piece) => {
                const [primaryImage] = piece.images;

                return (
                  <li key={piece.id}>
                    <ProductCardRoot size="sm">
                      {piece.reservedUntil && (
                        <ProductCardCountdown expiresAt={piece.reservedUntil} />
                      )}
                      <ProductCardMedia size="sm">
                        <ProductCardImage
                          size="sm"
                          url={primaryImage?.url || ""}
                          alt={primaryImage?.alt || ""}
                        />
                      </ProductCardMedia>
                      <ProductCardContent orientation="horizontal">
                        <ProductCardInfo
                          orientation="vertical"
                          name={piece.name}
                          brand={piece.brand.name}
                          size={piece.size.name}
                        />
                        <ProductCardPrice
                          pricing={calculatePiecePriceDisplayData(piece)}
                        />
                      </ProductCardContent>
                    </ProductCardRoot>
                  </li>
                );
              })}
            </ul>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              Anuluj zamowienie
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleResume}>
              Kontynuuj platnosc
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export { CheckoutRecoveryDialogProvider };
