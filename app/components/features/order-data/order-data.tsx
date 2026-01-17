import { Truck, User } from "lucide-react";
import type React from "react";

import { Badge } from "~/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemTitle,
} from "~/components/ui/item";
import { Separator } from "~/components/ui/separator";

import type { OrderDetails } from "~/lib/types";
import { cn } from "~/lib/utils";

const OrderData = ({
  orderData,
  className,
}: {
  orderData: OrderDetails;
} & React.ComponentProps<typeof Item>) => {
  return (
    <Item size="sm" variant="outline" className={cn("", className)}>
      <ItemHeader>
        <ItemTitle>
          <User className="size-4" />
          Dane klienta
        </ItemTitle>
      </ItemHeader>
      <ItemFooter className="flex-col gap-2 items-stretch">
        <ItemContent className="flex flex-row justify-between gap-4">
          <ItemDescription>Imię i nazwisko</ItemDescription>
          <ItemTitle className="text-right">{orderData.deliveryName}</ItemTitle>
        </ItemContent>
        <ItemContent className="flex flex-row justify-between gap-4">
          <ItemDescription>Email</ItemDescription>
          <ItemDescription className="text-right">
            {orderData.email}
          </ItemDescription>
        </ItemContent>
        <ItemContent className="flex flex-row justify-between gap-4">
          <ItemDescription>Telefon</ItemDescription>
          <ItemDescription className="text-right">
            {orderData.phoneNumber}
          </ItemDescription>
        </ItemContent>
      </ItemFooter>

      <Separator />

      <ItemHeader>
        <ItemTitle>
          <Truck className="size-4" />
          Dostawa
        </ItemTitle>
      </ItemHeader>
      <ItemFooter className="flex-col gap-2 items-stretch">
        <ItemContent className="flex flex-row justify-between gap-4">
          <ItemDescription>Metoda dostawy</ItemDescription>
          <ItemTitle className="text-right">
            {orderData.deliveryMethod === "locker" ? "Paczkomat" : "Kurier"}
          </ItemTitle>
        </ItemContent>
        {orderData.deliveryMethod === "locker" && (
          <ItemContent className="flex flex-row justify-between gap-4">
            <ItemDescription>Kod paczkomatu</ItemDescription>
            <ItemDescription className="text-right">
              <Badge variant="outline">{orderData.lockerCode}</Badge>
            </ItemDescription>
          </ItemContent>
        )}
        {orderData.deliveryMethod === "courier" && (
          <ItemContent className="flex flex-col gap-0.5">
            <ItemDescription className="text-right">
              {orderData.deliveryAddress.line1}
              {orderData.deliveryAddress.line2 &&
                `/${orderData.deliveryAddress.line2}`}
            </ItemDescription>
            <ItemDescription className="text-right">
              {orderData.deliveryAddress.postalCode}{" "}
              {orderData.deliveryAddress.city}
            </ItemDescription>
          </ItemContent>
        )}
      </ItemFooter>
    </Item>
  );
};

export { OrderData };
