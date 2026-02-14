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
import {
  PriceSummary,
  type PriceSummaryProps,
} from "~/components/features/price-summary/price-summary";
import {
  ProductCardContent,
  ProductCardImage,
  ProductCardInfo,
  ProductCardMeasurements,
  ProductCardMedia,
  ProductCardPieces,
  ProductCardPrice,
  ProductCardRoot,
} from "~/components/features/product-card/product-card-primitives";
import { OrderTimeline } from "~/components/features/timeline/order-timeline";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import {
  ORDER_STATUS_BADGE_TEXT_MAP,
  ORDER_STATUS_BADGE_VARIANT_MAP,
  cn,
  formatDate,
  groupOrderItems,
  priceDataToDisplayData,
} from "~/lib/utils";
import { orderDetailsFromOrder, orderStatusFromOrder } from "~/lib/utils";

import type { Route } from "./+types/orders-detail.page";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { orderNumber } = params;

  const session = context.get(sessionContext);

  if (!session || session.user.isAnonymous) {
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

const getPageTitle = (orderNumber: string) =>
  `Zamówienie #${orderNumber} | ACRM`;
export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) return [];

  const { order } = data;
  return [{ title: getPageTitle(order.orderNumber) }];
};

export default function OrderDetailsPage({ loaderData }: Route.ComponentProps) {
  const { order } = loaderData;

  const { products, pieces } = groupOrderItems(order.items);

  const canReturnItems = pieces.some(
    (piece) =>
      piece.status !== "returned" && piece.status !== "return_requested"
  );

  const priceSummaryItems: PriceSummaryProps["items"] = [
    ...products.map((product) => ({
      id: product.id,
      name: product.name,
      ...priceDataToDisplayData(product),
    })),
    ...pieces.map((piece) => ({
      id: piece.id,
      name: piece.name,
      ...priceDataToDisplayData(piece),
    })),
  ];

  const priceSummary: PriceSummaryProps = {
    items: priceSummaryItems,
    subtotal: priceSummaryItems.reduce((acc, item) => acc + item.finalPrice, 0),
    total: priceSummaryItems.reduce((acc, item) => acc + item.finalPrice, 0),
    totalSavings: priceSummaryItems.reduce(
      (acc, item) => acc + item.savings,
      0
    ),
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
                  <ProductCardRoot key={product.id}>
                    <ProductCardMedia size="lg">
                      <ProductCardImage
                        size="lg"
                        url={product.images[0]?.url || ""}
                        alt={product.images[0]?.alt || ""}
                      />
                    </ProductCardMedia>
                    <ProductCardContent>
                      <ProductCardInfo name={product.name} />
                      <ProductCardPrice
                        pricing={priceDataToDisplayData(product)}
                      />
                    </ProductCardContent>

                    <ProductCardPieces>
                      {product.pieces.map((piece) => {
                        const [primaryImage] = piece.images;

                        return (
                          <ProductCardRoot key={piece.id} size="sm">
                            <ProductCardMedia size="sm">
                              <ProductCardImage
                                size="sm"
                                url={primaryImage?.url || ""}
                                alt={primaryImage?.alt || ""}
                              />
                            </ProductCardMedia>
                            <ProductCardContent orientation="vertical">
                              <ProductCardInfo
                                name={piece.name}
                                brand={piece.brand?.name}
                                size={piece.size.name}
                                orientation="horizontal"
                                textSize="sm"
                              />
                              <ProductCardMeasurements
                                measurements={piece.measurements}
                              />
                            </ProductCardContent>
                          </ProductCardRoot>
                        );
                      })}
                    </ProductCardPieces>
                  </ProductCardRoot>
                ))}
                {pieces.map((piece) => (
                  <ProductCardRoot key={piece.id} size="sm">
                    <ProductCardMedia size="md">
                      <ProductCardImage
                        size="md"
                        url={piece.images[0]?.url || ""}
                        alt={piece.images[0]?.alt || ""}
                      />
                    </ProductCardMedia>
                    <ProductCardContent orientation="vertical">
                      <ProductCardContent>
                        <ProductCardInfo
                          name={piece.name}
                          brand={piece.brand?.name}
                          size={piece.size.name}
                          orientation="vertical"
                        />
                        <ProductCardPrice
                          pricing={priceDataToDisplayData(piece)}
                        />
                      </ProductCardContent>
                      <ProductCardMeasurements
                        measurements={piece.measurements}
                      />
                    </ProductCardContent>
                  </ProductCardRoot>
                ))}
              </ItemGroup>
            </ItemContent>
          </Item>
        </div>
      </div>
    </main>
  );
}
