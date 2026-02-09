import { createFormHookContexts } from "@tanstack/react-form";
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, XIcon } from "lucide-react";
import React from "react";
import type z from "zod";

import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import Image from "~/components/ui/image";

import clodinaryLocalisation from "~/lib/claudinary-localisation.json";
import type { ImagesFormSchema } from "~/lib/schemas";
import type { CloudinaryResult } from "~/lib/types";

import { CloudinaryWidget } from "../claudinary-widget/claudinary-widget";

const { useFieldContext } = createFormHookContexts();

export function ImagesField({
  label,
  description,
  uploadPreset,
}: {
  label: string;
  description: string;
  uploadPreset: string;
}) {
  const imagesField = useFieldContext<z.infer<typeof ImagesFormSchema>>();

  const [isOpen, setIsOpen] = React.useState(false);
  const latestValueRef = React.useRef<z.infer<typeof ImagesFormSchema>>(
    imagesField.state.value
  );
  const pendingResultsRef = React.useRef<CloudinaryResult[]>([]);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Keep the latest value in sync
  React.useEffect(() => {
    latestValueRef.current = imagesField.state.value;
  }, [imagesField.state.value]);

  const handleAdd = (result: CloudinaryResult) => {
    pendingResultsRef.current.push(result);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      const current = latestValueRef.current;
      const newValue = [...current];

      pendingResultsRef.current.forEach((result) => {
        newValue.push({
          url: result.secure_url,
          width: result.width,
          height: result.height,
          displayOrder: newValue.length,
          alt: result.original_filename,
          filename: result.original_filename,
          mimeType: result.format,
          filesize: result.bytes,
        });
      });

      pendingResultsRef.current = [];
      imagesField.handleChange(newValue);
    }, 1000);
  };

  React.useEffect(() => {
    if (isOpen === false) {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleRemove = (index: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      pendingResultsRef.current = [];
    }

    const newValue = imagesField.state.value.filter((_, i) => i !== index);
    imagesField.handleChange(
      newValue.map((img, i) => ({ ...img, displayOrder: i }))
    );
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      pendingResultsRef.current = [];
    }

    const newValue = [...imagesField.state.value];
    const [movedItem] = newValue.splice(fromIndex, 1);
    if (!movedItem) return;
    newValue.splice(toIndex, 0, movedItem);
    imagesField.handleChange(
      newValue.map((img, i) => ({ ...img, displayOrder: i }))
    );
  };
  return (
    <Field
      data-invalid={
        imagesField.state.meta.isTouched && !imagesField.state.meta.isValid
      }
    >
      <FieldLabel htmlFor={imagesField.name}>{label}</FieldLabel>
      <div className="space-y-4">
        <div className="space-y-3">
          {imagesField.state.value.map((image, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 bg-muted rounded-lg border group"
            >
              <div className="w-16 h-16 bg-muted-foreground/10 rounded-md overflow-hidden shrink-0 relative">
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt || `Obraz produktu ${index + 1}`}
                  width={64}
                  height={64}
                  className="absolute inset-0 w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Obraz #{index + 1}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {image.width} × {image.height}
                  </span>
                  <div className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-md">
                    #{index + 1}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 transition-opacity">
                <div className="flex flex-col gap-1 items-center">
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => index > 0 && handleReorder(index, index - 1)}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      index < imagesField.state.value.length - 1 &&
                      handleReorder(index, index + 1)
                    }
                    disabled={index === imagesField.state.value.length - 1}
                  >
                    <ArrowDownIcon />
                  </Button>
                </div>
                <Button
                  size="sm"
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemove(index)}
                >
                  <XIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <CloudinaryWidget
          uploadPreset={uploadPreset}
          onSuccess={handleAdd}
          onDisplayChanged={setIsOpen}
          options={{
            clientAllowedFormats: ["png", "jpeg", "jpg", "webp", "svg"],
            language: "pl",
            text: clodinaryLocalisation,
          }}
        >
          {({ open }) => (
            <Button
              type="button"
              onClick={() => open()}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Dodaj kolejny obraz
            </Button>
          )}
        </CloudinaryWidget>
      </div>
      <FieldDescription>{description}</FieldDescription>
      {imagesField.state.meta.isTouched && !imagesField.state.meta.isValid && (
        <FieldError errors={imagesField.state.meta.errors} />
      )}
    </Field>
  );
}
