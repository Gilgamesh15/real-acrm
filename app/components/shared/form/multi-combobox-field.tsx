import { createFormHookContexts } from "@tanstack/react-form";
import { CheckIcon, ChevronsUpDown } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

const { useFieldContext } = createFormHookContexts();

export function MultiComboboxField({
  label,
  description,
  options,
  placeholder,
  searchPlaceholder,
  emptyStateMessage,
}: {
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyStateMessage?: string;
}) {
  const field = useFieldContext<string[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field orientation="responsive" data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {field.state.value.length > 0
              ? field.state.value
                  .map(
                    (val) =>
                      options.find((option) => option.value === val)?.label
                  )
                  .join(", ")
              : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList>
              <CommandEmpty>{emptyStateMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      field.handleChange(
                        field.state.value.includes(option.value)
                          ? field.state.value.filter((v) => v !== option.value)
                          : [...field.state.value, option.value]
                      );
                    }}
                  >
                    {option.label}
                    {field.state.value.includes(option.value) && (
                      <CheckIcon className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </Field>
  );
}
