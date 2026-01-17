import type { inferParserType } from "nuqs";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

import { getFilterSearchParams } from "~/lib/utils";

import { useFilters } from "./filter-provider";

export function DrawerOptionalSingleSelectFilter({
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
  const handleValueChange = (newValue: string) => {
    if (value === newValue) {
      onValueChange(null);
    } else {
      onValueChange(newValue);
    }
  };

  return (
    <AccordionItem value={label}>
      <AccordionTrigger className="py-3">{label}</AccordionTrigger>
      <AccordionContent asChild>
        <RadioGroup
          className="gap-2"
          value={value ?? "none"}
          onValueChange={handleValueChange}
        >
          {options.map((option) => (
            <Label
              htmlFor={option.value}
              className="flex items-center space-x-2 cursor-pointer"
              key={option.value}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              {option.label}
            </Label>
          ))}
        </RadioGroup>
      </AccordionContent>
    </AccordionItem>
  );
}
