import {
  Item,
  ItemContent,
  ItemFooter,
  ItemGroup,
  ItemHeader,
} from "~/components/ui/item";
import { Skeleton } from "~/components/ui/skeleton";

import { PieceInfoCardSkeleton } from "~/components/features/product-card/piece-info-card/piece-info-card-skeleton";
import { ProductInfoCardSkeleton } from "~/components/features/product-card/product-info-card/product-info-card-skeleton";

export function OrderCardSkeleton() {
  return (
    <Item className="group" size="sm" variant="outline">
      <ItemHeader className="-my-3 -mx-4 pb-3">
        <Skeleton className="min-w-[calc(100%+2rem)] min-h-[18px]" />
      </ItemHeader>

      <ItemHeader className="flex items-center justify-between">
        <ItemContent className="gap-0.5">
          <Skeleton className="h-[19px] w-[140px]" />
          <Skeleton className="h-[21px] w-[130px]" />
          <Skeleton className="h-[21px] w-[100px]" />
        </ItemContent>
        <ItemContent className="items-end text-right gap-0.5">
          <Skeleton className="h-[19px] w-[80px]" />
          <Skeleton className="h-[21px] w-[100px]" />
        </ItemContent>
      </ItemHeader>

      <ItemContent>
        <ItemGroup>
          <ProductInfoCardSkeleton />
          <ProductInfoCardSkeleton />
          <PieceInfoCardSkeleton />
        </ItemGroup>
      </ItemContent>

      <ItemFooter>
        <Skeleton className="w-full h-8" />
      </ItemFooter>
    </Item>
  );
}
