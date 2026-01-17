import { createFormHookContexts } from "@tanstack/react-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";

import { RichTextEditor } from "~/components/shared/rich-text/rich-text-editor";
import type { RichText } from "~/lib/types";

const { useFieldContext } = createFormHookContexts();

function RichTextField({
  label,
  description,
}: {
  label: string;
  description?: string;
}) {
  const field = useFieldContext<RichText>();

  return (
    <Field
      data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
    >
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <RichTextEditor
        defaultValue={field.state.value}
        onValueChange={field.handleChange}
      />
      <FieldDescription>{description}</FieldDescription>
      {field.state.meta.isTouched && !field.state.meta.isValid && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  );
}

export { RichTextField };
