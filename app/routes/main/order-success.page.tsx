import * as schema from "db/schema";
import { asc, eq } from "drizzle-orm";
import { ArrowRight, CheckCircle, Package } from "lucide-react";
import { useEffect } from "react";
import { Link, data } from "react-router";

import { buttonVariants } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";

import { OrderData } from "~/components/features/order-data/order-data";
import { PriceSummary } from "~/components/features/price-summary/price-summary";
import { PieceInfoCard } from "~/components/features/product-card/piece-info-card/piece-info-card";
import { ProductInfoCard } from "~/components/features/product-card/product-info-card/product-info-card";
import { authClient } from "~/lib/auth-client";
import { db } from "~/lib/db";
import {
  calculateProductPrice,
  cn,
  formatDate,
  groupPurchasableItems,
  orderDetailsFromOrder,
  priceFromGrosz,
} from "~/lib/utils";

import type { Route } from "./+types/order-success.page";

export async function loader({ params }: Route.LoaderArgs) {
  const { orderNumber } = params;

  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.orderNumber, orderNumber),
    with: {
      items: {
        with: {
          product: {
            columns: {
              description: false,
            },
            with: {
              images: {
                limit: 1,
                orderBy: asc(schema.images.displayOrder),
              },
            },
          },
          piece: {
            with: {
              brand: true,
              category: true,
              images: {
                limit: 1,
                orderBy: asc(schema.images.displayOrder),
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw data(null, { status: 404 });
  }

  return { order };
}

const PAGE_TITLE = "Zamówienie - sukces | ACRM";
export const meta: Route.MetaFunction = () => [{ title: PAGE_TITLE }];

export default function OrderSuccessPage({ loaderData }: Route.ComponentProps) {
  const { order } = loaderData;

  const session = authClient.useSession.get();

  const isLoggedIn =
    !!session && !session.isPending && !session.data?.user.isAnonymous;

  const { products, pieces } = groupPurchasableItems(order.items);

  const priceSummary = {
    subtotal: priceFromGrosz(order.subtotalInGrosz),
    totalDiscount: priceFromGrosz(order.totalDiscountInGrosz),
    total: priceFromGrosz(order.totalInGrosz),
    tax: priceFromGrosz(order.taxInGrosz),
    items: [
      ...products.map((product) => ({
        id: product.id,
        name: product.name,
        price: priceFromGrosz(calculateProductPrice(product).lineTotalInGrosz),
        discount: 0,
      })),
      ...pieces.map((piece) => ({
        id: piece.id,
        name: piece.name,
        price: priceFromGrosz(piece.priceInGrosz),
        discount: 0,
      })),
    ],
  };

  useEffect(() => {
    window.gtag?.("event", "purchase", {
      transaction_id: order.stripeCheckoutSessionId || order.orderNumber,
      currency: "PLN",
      tax: priceFromGrosz(order.taxInGrosz),
      shipping: 0,
      value: priceFromGrosz(order.totalInGrosz),
      items: order.items.map((item) => ({
        item_id: item.piece.id,
        item_name: item.piece.name,
        item_brand: item.piece.brand?.name,
        item_category: item.piece.category?.path[0]?.name,
        item_category2: item.piece.category?.path[1]?.name,
        item_category3: item.piece.category?.path[2]?.name,
        item_category4: item.piece.category?.path[3]?.name,
        item_category5: item.piece.category?.path[4]?.name,
        price: priceFromGrosz(item.piece.priceInGrosz),
      })),
    });
  }, [order]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-success text-success-foreground dark:bg-success dark:text-success-foreground rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-success-foreground dark:text-success-foreground" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Dziękujemy za zamówienie!
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Twoja płatność została pomyślnie przetworzona
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Numer zamówienia</span>
          </p>
          <p className="text-lg font-semibold text-foreground">
            #{order.orderNumber}
          </p>
          <p className="text-sm text-muted-foreground">
            Złożone dnia {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Order Details and Actions Section */}
        <div className="lg:col-span-2 space-y-6">
          <OrderData orderData={orderDetailsFromOrder(order)} />

          <PriceSummary {...priceSummary} className="lg:hidden" />

          {/* Actions */}
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle>Co dalej?</ItemTitle>
            </ItemHeader>
            <ItemContent>
              <p className="text-sm text-muted-foreground mb-4">
                Otrzymasz email z potwierdzeniem zamówienia oraz informacjami o
                dostawie.
              </p>
            </ItemContent>
            <ItemFooter>
              <Link
                to="/kategorie"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "justify-start flex-1"
                )}
              >
                Kontynuuj zakupy
              </Link>
              {isLoggedIn && (
                <Link
                  to={`/konto/zamowienia/${order.orderNumber}`}
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "justify-between flex-1"
                  )}
                >
                  Status zamówienia
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </ItemFooter>
          </Item>
        </div>

        {/* Ordered Items Section */}
        <div className="lg:col-span-3">
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle className="flex items-center gap-2 text-base">
                <Package className="w-5 h-5" />
                Zamówione przedmioty ({products.length + pieces.length})
              </ItemTitle>
            </ItemHeader>
            <ItemContent>
              <ItemGroup>
                {products.map((product) => (
                  <ProductInfoCard key={product.id} product={product} />
                ))}
                {pieces.map((piece) => (
                  <PieceInfoCard key={piece.id} piece={piece} />
                ))}
              </ItemGroup>
            </ItemContent>
          </Item>
          <PriceSummary {...priceSummary} className="mt-6 hidden lg:flexd" />
        </div>
      </div>
    </main>
  );
}
