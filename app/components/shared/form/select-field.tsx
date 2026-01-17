import { createFormHookContexts } from "@tanstack/react-form";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const { useFieldContext } = createFormHookContexts();

export function SelectField({
  label,
  description,
  options,
  placeholder,
}: {
  label: string;
  description?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  containerClassName?: string;
}) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field orientation="responsive" data-invalid={isInvalid}>
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
        {isInvalid && <FieldError errors={field.state.meta.errors} />}
      </FieldContent>
      <Select
        name={field.name}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={isInvalid}
          className="min-w-[120px]"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
