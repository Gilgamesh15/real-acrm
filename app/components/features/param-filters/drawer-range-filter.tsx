import type { inferParserType } from "nuqs";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Slider } from "~/components/ui/slider";

import { getFilterSearchParams } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils";

import { useFilters } from "./filter-provider";

export function DrawerRangeFilter({
  label,
  min,
  max,
  paramMin,
  paramMax,
}: {
  label: string;
  min: number;
  max: number;
  paramMin: keyof inferParserType<ReturnType<typeof getFilterSearchParams>>;
  paramMax: keyof inferParserType<ReturnType<typeof getFilterSearchParams>>;
}) {
  const { filters, setFilters } = useFilters();
  const value = [filters[paramMin], filters[paramMax]] as [number, number];
  const onValueChange = (newValue: [number, number]) => {
    setFilters({
      ...filters,
      [paramMin]: newValue[0],
      [paramMax]: newValue[1],
    });
  };
  return (
    <AccordionItem value={label}>
      <AccordionTrigger className="py-3">{label}</AccordionTrigger>
      <AccordionContent className="pt-0 pb-4">
        <div className="space-y-4 px-1 pt-4">
          <Slider
            value={value}
            onValueChange={([val1, val2]) => onValueChange([val1, val2])}
            min={min}
            max={max}
            step={1}
          />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {formatCurrency(value[0])}
            </span>
            <span className="text-muted-foreground text-sm">
              {formatCurrency(value[1])}
            </span>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
