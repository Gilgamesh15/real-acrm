import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type { inferParserType } from "nuqs";

import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { getFilterSearchParams } from "~/lib/utils";
import { cn } from "~/lib/utils";

import { useFilters } from "./filter-provider";

export function OptionalSingleSelectFilter({
  label,
  options,
  param,
}: {
  label: string;
  options: { value: string; label: string }[];
  param: keyof inferParserType<ReturnType<typeof getFilterSearchParams>>;
}) {
  const { filters, setFilters } = useFilters();
  const value = filters[param] as string | null;
  const onValueChange = (newValue: string | null) => {
    setFilters({ ...filters, [param]: newValue });
  };

  const handleValueChange = (newValue: string | null) => {
    if (value === newValue) {
      onValueChange(null);
    } else {
      onValueChange(newValue);
    }
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
        className="min-w-48 w-fit p-0.5 flex flex-col font-secondary max-h-[300px] overflow-y-auto"
        align="start"
      >
        {options.map((option) => {
          const isSelected = value ? value === option.value : false;
          return (
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-between"
              onClick={() => handleValueChange(option.value)}
            >
              {option.label}
              <CheckIcon
                className={cn(
                  "size-4 transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
            </Button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
