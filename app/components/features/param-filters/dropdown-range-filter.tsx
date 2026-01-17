import { ChevronDownIcon } from "lucide-react";
import type { inferParserType } from "nuqs";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Slider } from "~/components/ui/slider";

import { getFilterSearchParams } from "~/lib/utils";
import { formatCurrency } from "~/lib/utils";

import { useFilters } from "./filter-provider";

export function RangeFilter({
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {label}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-4 font-secondary max-h-[300px] overflow-y-auto"
        align="start"
      >
        <div className="space-y-4">
          <h4 className="text-sm font-medium">{label}</h4>
          <Slider
            value={value}
            onValueChange={onValueChange}
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
      </PopoverContent>
    </Popover>
  );
}
