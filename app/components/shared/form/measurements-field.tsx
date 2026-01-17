import { createFormHookContexts } from "@tanstack/react-form";
import { PlusIcon, XIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";

import type { MeasurementsFormSchemaType } from "~/lib/schemas";

const { useFieldContext } = createFormHookContexts();

function MeasurementsField({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  // Get the field context for the measurements array
  const field = useFieldContext<MeasurementsFormSchemaType>();

  return (
    <FieldSet>
      <FieldLegend>{label}</FieldLegend>
      <FieldDescription>{description}</FieldDescription>
      <FieldSeparator />

      <FieldGroup className="gap-4">
        {field.state.value.map((measurement, index) => (
          <div key={index} className="flex flex-row gap-2">
            {/* Name field */}
            <Field className="flex-1">
              <FieldLabel className={index !== 0 ? "sr-only" : ""}>
                Nazwa
              </FieldLabel>
              <Input
                value={measurement.name}
                onChange={(e) => {
                  const newMeasurements = [...field.state.value];
                  newMeasurements[index] = {
                    ...newMeasurements[index],
                    name: e.target.value,
                  };
                  field.handleChange(newMeasurements);
                }}
                placeholder="Nazwa wymiaru"
              />
            </Field>

            {/* Value field */}
            <Field className="flex-1">
              <FieldLabel className={index !== 0 ? "sr-only" : ""}>
                Wartość
              </FieldLabel>
              <Input
                type="number"
                value={measurement.value}
                onChange={(e) => {
                  const newMeasurements = [...field.state.value];
                  newMeasurements[index] = {
                    ...newMeasurements[index],
                    value: e.target.valueAsNumber,
                  };
                  field.handleChange(newMeasurements);
                }}
                placeholder="Wartość wymiaru"
              />
            </Field>

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => {
                const newMeasurements = field.state.value.filter(
                  (_, i) => i !== index
                );
                field.handleChange(newMeasurements);
              }}
              className="self-end mb-3"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            field.handleChange([...field.state.value, { name: "", value: 0 }]);
          }}
        >
          <PlusIcon className="h-4 w-4" />
          Dodaj wymiar
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}

export { MeasurementsField };
