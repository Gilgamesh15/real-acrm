import type { inferParserType } from "nuqs";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

import { getFilterSearchParams } from "~/lib/utils";

import { useFilters } from "./filter-provider";

export function DrawerMultiSelectFilter({
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

  return (
    <AccordionItem value={label}>
      <AccordionTrigger className="py-3">{label}</AccordionTrigger>
      <AccordionContent className="space-y-2">
        {options.map((option) => (
          <Label
            htmlFor={option.value}
            className="flex items-center space-x-2"
            key={option.value}
          >
            <Checkbox
              checked={value.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onValueChange([...value, option.value]);
                } else {
                  onValueChange(value.filter((v) => v !== option.value));
                }
              }}
              id={option.value}
            />
            {option.label}
          </Label>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
}
