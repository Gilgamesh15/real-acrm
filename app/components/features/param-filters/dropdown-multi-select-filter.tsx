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

export function MultiSelectFilter({
  label,
  options,
  param,
}: {
  label: string;
  options: { value: string; label: string }[];
  param: keyof inferParserType<ReturnType<typeof getFilterSearchParams>>;
}) {
  const { filters, setFilters } = useFilters();

  const value = filters[param] as string[];
  const onValueChange = (newValue: string[]) => {
    setFilters({ ...filters, [param]: newValue });
  };

  const handleValueChange = (newValue: string) => {
    if (value.includes(newValue)) {
      onValueChange(value.filter((v) => v !== newValue));
    } else {
      onValueChange([...value, newValue]);
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
          const isSelected = value.includes(option.value);
          return (
            <Button
              key={option.value}
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
