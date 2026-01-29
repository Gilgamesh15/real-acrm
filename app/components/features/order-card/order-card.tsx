import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";

import type { DBQueryResult } from "~/lib/types";
import {
  ORDER_STATUS_BADGE_TEXT_MAP,
  ORDER_STATUS_BADGE_VARIANT_MAP,
  cn,
  formatCurrency,
  formatDate,
  groupPurchasableItems,
  orderStatusFromOrder,
  priceFromGrosz,
} from "~/lib/utils";

import { PieceInfoCard } from "../product-card/piece-info-card/piece-info-card";
import { ProductInfoCard } from "../product-card/product-info-card/product-info-card";

interface OrderCardProps {
  order: DBQueryResult<
    "orders",
    {
      with: {
        events: true;
        items: {
          with: {
            product: {
              with: {
                images: true;
                pieces: true;
              };
            };
            piece: {
              with: {
                images: true;
              };
            };
          };
        };
      };
    }
  >;
}

export function OrderCard({ order }: OrderCardProps) {
  const { products, pieces } = groupPurchasableItems(order.items);

  const totalItems = products.length + pieces.length;
  const orderStatus = orderStatusFromOrder(order);

  return (
    <>
      <Item className="group" size="sm" variant="outline">
        <ItemHeader className="-my-3 -mx-4 pb-3">
          <Badge
            variant={ORDER_STATUS_BADGE_VARIANT_MAP[orderStatus]}
            className="w-[calc(100%+2rem)] text-center"
          >
            {ORDER_STATUS_BADGE_TEXT_MAP[orderStatus]}
          </Badge>
        </ItemHeader>

        <ItemHeader className="flex items-center justify-between">
          <ItemContent className="gap-0.5">
            <ItemTitle>Zamówienie #{order.orderNumber}</ItemTitle>
            <ItemDescription>{formatDate(order.createdAt)}</ItemDescription>
            <ItemDescription>
              {totalItems} {getPrzedmiotText(totalItems)}
            </ItemDescription>
          </ItemContent>
          <ItemContent className="items-end text-right gap-0.5">
            <ItemTitle className="font-semibold text-foreground">
              {formatCurrency(priceFromGrosz(order.subtotalInGrosz))}
            </ItemTitle>
            <ItemDescription>Zawiera VAT</ItemDescription>
          </ItemContent>
        </ItemHeader>

        <ItemContent>
          <ItemGroup>
            {products.map((item) => (
              <ProductInfoCard key={item.id} product={item} />
            ))}
            {pieces.map((item) => (
              <PieceInfoCard key={item.id} piece={item} />
            ))}
          </ItemGroup>
        </ItemContent>

        <ItemFooter>
          <Link
            to={`/konto/zamowienia/${order.orderNumber}`}
            className={cn(
              buttonVariants({
                variant: "outline",
                size: "sm",
              }),
              "w-full"
            )}
          >
            Szczegóły zamówienia
            <ArrowRight />
          </Link>
        </ItemFooter>
      </Item>
    </>
  );
}

const getPrzedmiotText = (count: number) => {
  if (count === 1) return "przedmiot";
  if (count >= 2 && count <= 4) return "przedmioty";
  return "przedmiotów";
};
