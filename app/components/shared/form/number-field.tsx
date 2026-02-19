import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { NumericFormat } from "react-number-format";
import type { NumericFormatProps } from "react-number-format";

import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";

import { useFieldContext } from "./index";

function NumberField({
  stepper,
  thousandSeparator,
  placeholder,
  defaultValue,
  min = -Infinity,
  max = Infinity,
  fixedDecimalScale = false,
  decimalScale = 0,
  suffix,
  prefix,
  label,
  description,
  ...props
}: Omit<NumericFormatProps, "value" | "onValueChange"> & {
  stepper?: number;
  thousandSeparator?: string;
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  suffix?: string;
  prefix?: string;
  fixedDecimalScale?: boolean;
  decimalScale?: number;
  label: string;
  description?: string;
}) {
  const field = useFieldContext<number | undefined>();

  const ref = useRef<HTMLInputElement>(null);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const value = field.state.value;
  const onValueChange = field.handleChange;

  const handleIncrement = useCallback(() => {
    onValueChange((prev) =>
      prev === undefined ? (stepper ?? 1) : Math.min(prev + (stepper ?? 1), max)
    );
  }, [stepper, max]);

  const handleDecrement = useCallback(() => {
    onValueChange((prev) =>
      prev === undefined
        ? -(stepper ?? 1)
        : Math.max(prev - (stepper ?? 1), min)
    );
  }, [stepper, min]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement ===
        (ref as React.RefObject<HTMLInputElement>).current
      ) {
        if (e.key === "ArrowUp") {
          handleIncrement();
        } else if (e.key === "ArrowDown") {
          handleDecrement();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleIncrement, handleDecrement, ref]);

  useEffect(() => {
    if (value !== undefined) {
      onValueChange(value);
    }
  }, [value]);

  const handleChange = (values: {
    value: string;
    floatValue: number | undefined;
  }) => {
    const newValue =
      values.floatValue === undefined ? undefined : values.floatValue;
    onValueChange(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  const handleBlur = () => {
    if (value !== undefined) {
      if (value < min) {
        onValueChange(min);
        (ref as React.RefObject<HTMLInputElement>).current!.value = String(min);
      } else if (value > max) {
        onValueChange(max);
        (ref as React.RefObject<HTMLInputElement>).current!.value = String(max);
      }
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

      <div className="flex items-center">
        <NumericFormat
          value={value}
          onValueChange={handleChange}
          thousandSeparator={thousandSeparator}
          decimalScale={decimalScale}
          fixedDecimalScale={fixedDecimalScale}
          allowNegative={min < 0}
          valueIsNumericString
          onBlur={handleBlur}
          max={max}
          min={min}
          suffix={suffix}
          prefix={prefix}
          customInput={Input}
          placeholder={placeholder}
          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative"
          getInputRef={ref}
          {...props}
        />

        <div className="flex flex-col">
          <Button
            aria-label="Increase value"
            className="px-2 h-5 rounded-l-none rounded-br-none border-input border-l-0 border-b-[0.5px] focus-visible:relative"
            variant="outline"
            onClick={handleIncrement}
            disabled={value === max}
          >
            <ChevronUp size={15} />
          </Button>
          <Button
            aria-label="Decrease value"
            className="px-2 h-5 rounded-l-none rounded-tr-none border-input border-l-0 border-t-[0.5px] focus-visible:relative"
            variant="outline"
            onClick={handleDecrement}
            disabled={value === min}
          >
            <ChevronDown size={15} />
          </Button>
        </div>
      </div>
      <FieldDescription>{description}</FieldDescription>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export { NumberField };
