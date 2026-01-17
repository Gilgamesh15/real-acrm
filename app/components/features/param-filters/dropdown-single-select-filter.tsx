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

export function SingleSelectFilter({
  label,
  options,
  param,
}: {
  label: string;
  options: { value: string; label: string }[];
  param: keyof inferParserType<ReturnType<typeof getFilterSearchParams>>;
}) {
  const { filters, setFilters } = useFilters();
  const value = filters[param] as string;
  const onValueChange = (newValue: string) => {
    setFilters({ ...filters, [param]: newValue });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {options.find((option) => option.value === value)?.label || label}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-48 w-fit p-0.5 flex flex-col font-secondary max-h-[300px] overflow-y-auto"
        align="start"
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <Button
              variant="ghost"
              size="sm"
              className="flex w-full items-center justify-between"
              onClick={() => onValueChange(option.value)}
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
