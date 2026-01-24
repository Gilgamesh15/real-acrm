import { createFormHookContexts } from "@tanstack/react-form";
import { MonitorIcon, UploadIcon, XIcon } from "lucide-react";
import React from "react";
import type z from "zod";

import { Button } from "~/components/ui/button";
import { Image } from "~/components/ui/image";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";

import { CloudinaryWidget } from "~/components/shared/claudinary-widget/claudinary-widget";
import clodinaryLocalisation from "~/lib/claudinary-localisation.json";
import type { ImageFormSchema } from "~/lib/schemas";
import type { CloudinaryResult } from "~/lib/types";

const { useFieldContext } = createFormHookContexts();

export function ImageField({
  label,
  description,
  uploadPreset,
}: {
  label: string;
  description: string;
  uploadPreset: string;
}) {
  const imageField = useFieldContext<
    z.infer<typeof ImageFormSchema> | undefined
  >();

  const [isOpen, setIsOpen] = React.useState(false);
  const handleSave = (result: CloudinaryResult) => {
    imageField.handleChange?.({
      url: result.secure_url,
      filename: result.original_filename,
      mimeType: result.format,
      filesize: result.bytes,
      width: result.width,
      height: result.height,
      alt: result.original_filename,
    });
  };

  React.useEffect(() => {
    if (isOpen === false) {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  return (
    <Field
      data-invalid={
        imageField.state.meta.isTouched && !imageField.state.meta.isValid
      }
    >
      <FieldLabel htmlFor={imageField.name}>{label}</FieldLabel>
      <div className="space-y-4">
        {imageField.state.value ? (
          <div className="relative group">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden border relative">
              <Image
                src={imageField.state.value.url || "/placeholder.svg"}
                alt={imageField.state.value.alt || "Przesłany obraz produktu"}
                aspectRatio={16 / 9}
                quality="auto:good"
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => imageField.handleChange?.(undefined)}
                className="h-7 w-7 p-0 rounded-md"
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-lg border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">Przesłany obraz</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {imageField.state.value.width} ×{" "}
                      {imageField.state.value.height}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-xs text-green-600">Aktywny</span>
                    </div>
                  </div>
                </div>
                <MonitorIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ) : (
          <CloudinaryWidget
            uploadPreset={uploadPreset}
            onSuccess={handleSave}
            onDisplayChanged={setIsOpen}
            options={{
              clientAllowedFormats: ["png", "jpeg", "jpg", "webp", "svg"],
              language: "pl",
              text: clodinaryLocalisation,
            }}
          >
            {({ open }) => {
              return (
                <div
                  onClick={() => open()}
                  className="aspect-video border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors bg-muted/30"
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                    <UploadIcon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1">Prześlij obraz</p>
                  <p className="text-xs text-muted-foreground">
                    Kliknij, aby wybrać plik
                  </p>
                </div>
              );
            }}
          </CloudinaryWidget>
        )}
      </div>
      <FieldDescription>{description}</FieldDescription>
      {imageField.state.meta.isTouched && !imageField.state.meta.isValid && (
        <FieldError errors={imageField.state.meta.errors} />
      )}
    </Field>
  );
}
