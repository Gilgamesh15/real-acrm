import { ShoppingBasket, XIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

import {
  calculatePiecePriceDisplayData,
  calculateProductPriceDisplayData,
  pieceToGoogleAnalyticsItem,
  productToGoogleAnalyticsItem,
} from "~/lib/utils";

import type { PriceSummaryProps } from "../price-summary/price-summary";
import { PriceSummary } from "../price-summary/price-summary";
import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMedia,
  ProductCardPieces,
  ProductCardPrice,
  ProductCardRemoveButton,
  ProductCardRoot,
} from "../product-card/product-card-primitives";
import { useCart } from "../providers/cart-provider";
import { useCheckoutDialog } from "../providers/checkout-dialog-provider";

export const NavCartButton = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const {
    items: { products, pieces },
    cartCount,
    removeProduct,
    removePiece,
  } = useCart();

  const priceSummary: PriceSummaryProps = React.useMemo(() => {
    const priceSummaryItems: PriceSummaryProps["items"] = [
      ...products.map((product) => ({
        id: product.id,
        name: product.name,
        ...calculateProductPriceDisplayData(product),
      })),
      ...pieces.map((piece) => ({
        id: piece.id,
        name: piece.name,
        ...calculatePiecePriceDisplayData(piece),
      })),
    ];
    return {
      items: priceSummaryItems,
      subtotal: priceSummaryItems.reduce(
        (acc, item) => acc + item.finalPrice,
        0
      ),
      total: priceSummaryItems.reduce((acc, item) => acc + item.finalPrice, 0),
      totalSavings: priceSummaryItems.reduce(
        (acc, item) => acc + item.savings,
        0
      ),
    };
  }, [products, pieces]);

  const { goToCheckout } = useCheckoutDialog();

  // Fire view_cart event when drawer opens with items (only once per cart state)
  React.useEffect(() => {
    if (isOpen && cartCount > 0) {
      window.gtag?.("event", "view_cart", {
        currency: "PLN",
        value: priceSummary.total,
        items: [
          ...products.flatMap((product) =>
            productToGoogleAnalyticsItem(product)
          ),
          ...pieces.map((piece) => pieceToGoogleAnalyticsItem(piece)),
        ],
      });
    }
  }, [isOpen, cartCount, priceSummary.total, products, pieces]);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingBasket className="size-5" />
          {cartCount !== undefined && cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-xs rounded-full p-1.5 aspect-square size-5 flex items-center justify-center text-primary-foreground">
              {cartCount}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="min-w-xs">
        <DrawerHeader>
          <div className="flex flex-row items-center justify-between gap-4">
            <DrawerTitle>Koszyk ({cartCount})</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <XIcon className="size-4" />
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription>
            Przeglądaj swoje zamówienie przed przejściem do kasy.
          </DrawerDescription>
        </DrawerHeader>
        {products.length === 0 && pieces.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ShoppingBasket className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Koszyk jest pusty</EmptyTitle>
              <EmptyDescription>
                Dodaj produkty do koszyka, aby zobaczyć je tutaj.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="h-full overflow-auto p-3">
            <ul className="space-y-4">
              {products.map((product, index) => {
                const [primaryImage] = product.images;

                return (
                  <li key={product.id}>
                    <ProductCardRoot size="sm">
                      <ProductCardMedia>
                        <ProductCardImage
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/projekty/${product.slug}`);
                          }}
                          url={primaryImage?.url || ""}
                          alt={primaryImage?.alt || ""}
                        />
                      </ProductCardMedia>
                      <ProductCardContent>
                        <ProductCardInfo
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/projekty/${product.slug}`);
                          }}
                          name={product.name}
                        />
                        <ProductCardPrice
                          pricing={calculateProductPriceDisplayData(product)}
                        />
                      </ProductCardContent>

                      <ProductCardRemoveButton
                        onClick={() =>
                          removeProduct(product.id, true, {
                            item_list_id: `cart`,
                            item_list_name: "Koszyk",
                            index: index,
                          })
                        }
                      />
                      <ProductCardPieces>
                        {product.pieces.map((piece) => {
                          const [primaryImage] = piece.images;
                          return (
                            <ProductCardRoot key={piece.id} size="sm">
                              <ProductCardMedia size="sm">
                                <ProductCardImage
                                  size="sm"
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/ubrania/${piece.slug}`);
                                  }}
                                  url={primaryImage?.url || ""}
                                  alt={primaryImage?.alt || ""}
                                />
                              </ProductCardMedia>
                              <ProductCardContent>
                                <ProductCardInfo
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/ubrania/${piece.slug}`);
                                  }}
                                  name={piece.name}
                                  textSize="sm"
                                  brand={piece.brand?.name}
                                  size={piece.size?.name}
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
              {pieces.map((piece, index) => {
                const [primaryImage] = piece.images;

                return (
                  <li key={piece.id}>
                    <ProductCardRoot size="sm">
                      <ProductCardMedia size="sm">
                        <ProductCardImage
                          size="sm"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/ubrania/${piece.slug}`);
                          }}
                          url={primaryImage?.url || ""}
                          alt={primaryImage?.alt || ""}
                        />
                      </ProductCardMedia>
                      <ProductCardContent orientation="horizontal">
                        <ProductCardInfo
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/ubrania/${piece.slug}`);
                          }}
                          orientation="vertical"
                          name={piece.name}
                          brand={piece.brand?.name}
                          size={piece.size?.name}
                        />
                        <ProductCardPrice
                          pricing={calculatePiecePriceDisplayData(piece)}
                        />
                      </ProductCardContent>

                      <ProductCardRemoveButton
                        onClick={() =>
                          removePiece(piece.id, true, {
                            item_list_id: `cart`,
                            item_list_name: "Koszyk",
                            index: index + products.length,
                          })
                        }
                      />
                    </ProductCardRoot>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <DrawerFooter>
          <PriceSummary {...priceSummary} />

          <Button
            className="w-full"
            onClick={() => {
              if (cartCount === 0) {
                toast.message("Koszyk jest pusty", {
                  description:
                    "Dodaj produkty do koszyka, aby przejść do kasy.",
                  duration: 3000,
                  position: "bottom-right",
                  icon: <ShoppingBasket className="size-4" />,
                });
                return;
              }
              setIsOpen(false);
              goToCheckout();
            }}
          >
            Przejdź do kasy
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
