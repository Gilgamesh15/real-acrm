import {
  Item,
  ItemContent,
  ItemFooter,
  ItemHeader,
} from "~/components/ui/item";
import { Separator } from "~/components/ui/separator";

import { cn, formatCurrency } from "~/lib/utils";

type PriceSummaryItem = {
  id: string;
  name: string;
  price: number;
};

type PriceSummaryProps = {
  className?: string;
  items: PriceSummaryItem[];
  subtotal: number;
  total: number;
};

const PriceSummary = ({
  className,
  items,
  subtotal,
  total,
}: PriceSummaryProps) => {
  return (
    <Item size="sm" variant="outline" className={cn("h-fit", className)}>
      <ItemHeader className="flex-col gap-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between w-full items-baseline"
          >
            <span className="text-foreground text-sm">{item.name}</span>
            <span className="font-medium text-foreground">
              {formatCurrency(item.price)}
            </span>
          </div>
        ))}
      </ItemHeader>

      {items.length > 0 && <Separator />}

      <ItemContent className="gap-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Suma częściowa</span>
          <span className="text-foreground">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Dostawa</span>
          <span className="text-foreground">{formatCurrency(0)}</span>
        </div>
      </ItemContent>

      <Separator />

      <ItemFooter className="flex-col items-stretch gap-1.5">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="text-foreground font-medium">Razem</span>

            <p className="text-xs text-muted-foreground text-center">
              Cena Zawiera VAT.
            </p>
          </div>
          <span className="text-2xl font-semibold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </ItemFooter>
    </Item>
  );
};

export { PriceSummary };
