import { createFormHookContexts } from "@tanstack/react-form";
import React from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";

import type { RichText } from "~/lib/types";

const { useFieldContext } = createFormHookContexts();

const RichTextEditor = React.lazy(() =>
  import("~/components/shared/rich-text/rich-text-editor").then((module) => ({
    default: module.RichTextEditor,
  }))
);

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
      <React.Suspense fallback={<Spinner />}>
        <RichTextEditor
          defaultValue={field.state.value}
          onValueChange={field.handleChange}
        />
      </React.Suspense>
      <FieldDescription>{description}</FieldDescription>
      {field.state.meta.isTouched && !field.state.meta.isValid && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  );
}

export { RichTextField };
