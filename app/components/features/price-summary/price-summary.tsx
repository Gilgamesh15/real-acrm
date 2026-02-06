import { Tag } from "lucide-react";

import { Separator } from "~/components/ui/separator";

import type { PriceDisplayData } from "~/lib/types";
import { cn, formatCurrency, formatDiscountLabel } from "~/lib/utils";

export type PriceSummaryProps = {
  className?: string;
  items: ({ id: string; name: string } & PriceDisplayData)[];
  subtotal: number;
  total: number;
  totalSavings: number;
};

function PriceSummary({
  className,
  items,
  subtotal,
  total,
  totalSavings = 0,
}: PriceSummaryProps) {
  const hasAnyDiscount = items.some((item) => item.hasDiscount);

  return (
    <div
      className={cn(
        "rounded-lg border border-border overflow-hidden",
        className
      )}
    >
      {/* Savings Banner - Vinted style */}
      {hasAnyDiscount && totalSavings > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900 px-4 py-2.5 flex items-center gap-2">
          <Tag className="size-4 text-emerald-600 dark:text-emerald-500" />
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            Oszczędzasz {formatCurrency(totalSavings)} na tym zamówieniu!
          </span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-foreground text-sm block">
                  {item.name}
                </span>
                {item.hasDiscount && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">
                    {formatDiscountLabel(item.discount)} zniżki
                  </span>
                )}
              </div>
              <div className="text-right">
                {item.hasDiscount && (
                  <span className="text-muted-foreground text-xs line-through block">
                    {formatCurrency(item.originalPrice)}
                  </span>
                )}
                <span className="font-medium text-foreground">
                  {formatCurrency(item.finalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Produkty</span>
            <span className="text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dostawa</span>
            <span className="text-emerald-600 dark:text-emerald-500 font-medium">
              Bezpłatna
            </span>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-foreground font-semibold">Do zapłaty</span>
            <p className="text-xs text-muted-foreground">w tym VAT</p>
          </div>
          <div className="text-right">
            {hasAnyDiscount && totalSavings > 0 && (
              <span className="text-xs text-muted-foreground line-through block">
                {formatCurrency(subtotal + totalSavings)}
              </span>
            )}
            <span className="text-2xl font-bold text-foreground">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PriceSummary };
