import * as schema from "db/schema";
import { and, desc, eq } from "drizzle-orm";
import { RotateCcwIcon } from "lucide-react";
import { Link } from "react-router";
import { data, redirect } from "react-router";

import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";

import { OrderData } from "~/components/features/order-data/order-data";
import { PriceSummary } from "~/components/features/price-summary/price-summary";
import { DetailedPieceCard } from "~/components/features/product-card/detailed-piece-card/detailed-piece-card";
import { DetailedProductCard } from "~/components/features/product-card/detailed-product-card/detailed-product-card";
import { OrderTimeline } from "~/components/features/timeline/order-timeline";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import {
  ORDER_STATUS_BADGE_TEXT_MAP,
  ORDER_STATUS_BADGE_VARIANT_MAP,
  calculateProductPrice,
  cn,
  formatDate,
  getOrderItems,
} from "~/lib/utils";
import {
  orderDetailsFromOrder,
  orderStatusFromOrder,
  priceFromGrosz,
} from "~/lib/utils";

import type { Route } from "./+types/orders-detail.page";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { orderNumber } = params;

  const session = context.get(sessionContext);

  if (session.user.isAnonymous) {
    throw redirect("/zaloguj-sie", {
      status: 302,
    });
  }

  const userId = session.user.id;

  const order = await db.query.orders.findFirst({
    where: and(
      eq(schema.orders.userId, userId),
      eq(schema.orders.orderNumber, orderNumber)
    ),
    with: {
      events: {
        orderBy: desc(schema.orderTimelineEvents.timestamp),
      },
      items: {
        with: {
          product: {
            with: {
              images: true,
              pieces: {
                with: {
                  images: true,
                  brand: true,
                  size: true,
                  measurements: true,
                },
              },
            },
          },
          piece: {
            with: {
              images: true,
              brand: true,
              size: true,
              measurements: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw data(null, { status: 404 });
  }

  return {
    order,
  };
}

export default function OrderDetailsPage({ loaderData }: Route.ComponentProps) {
  const { order } = loaderData;

  const { products, pieces } = getOrderItems(order);

  const canReturnItems = pieces.some(
    (piece) =>
      piece.status !== "returned" && piece.status !== "return_requested"
  );

  const priceSummary = {
    subtotal: priceFromGrosz(order.subtotalInGrosz),
    totalDiscount: 0,
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

  const orderDetails = orderDetailsFromOrder(order);

  const orderStatus = orderStatusFromOrder(order);

  return (
    <main className={cn("space-y-6")}>
      {/* Header Section with Status Badge */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              Zamówienie
              <br />#{order.orderNumber}
            </h1>
            <p className="text-muted-foreground">
              Złożone dnia {formatDate(order.createdAt)}
            </p>
          </div>
          <Badge variant={ORDER_STATUS_BADGE_VARIANT_MAP[orderStatus]}>
            {ORDER_STATUS_BADGE_TEXT_MAP[orderStatus]}
          </Badge>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Timeline and Summary Section */}
        <div className="lg:col-span-2 space-y-6">
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle className="text-base">Status zamówienia</ItemTitle>
            </ItemHeader>
            <ItemContent>
              <OrderTimeline events={order.events} />
            </ItemContent>
          </Item>

          <OrderData orderData={orderDetails} />
          <PriceSummary {...priceSummary} />
          {canReturnItems && (
            <Link
              to={`/zwroty?num=${order.orderNumber}&email=${orderDetails.email}`}
              className={cn(
                buttonVariants({
                  size: "sm",
                  variant: "outline",
                }),
                "w-full justify-between"
              )}
            >
              <span> Zgłoś zwrot</span>
              <RotateCcwIcon />
            </Link>
          )}
        </div>

        <div className="lg:col-span-3">
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle className="text-base">Zamówione przedmioty</ItemTitle>
            </ItemHeader>
            <ItemContent>
              <ItemGroup>
                {products.map((product) => (
                  <DetailedProductCard key={product.id} product={product} />
                ))}
                {pieces.map((piece) => (
                  <DetailedPieceCard key={piece.id} piece={piece} />
                ))}
              </ItemGroup>
            </ItemContent>
          </Item>
        </div>
      </div>
    </main>
  );
}
