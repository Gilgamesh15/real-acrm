import { eq, inArray, ne } from "drizzle-orm";
import {
  CheckCircleIcon,
  ChevronLeftIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react";
import { XIcon } from "lucide-react";
import React from "react";
import {
  Link,
  isRouteErrorResponse,
  useFetcher,
  useNavigate,
} from "react-router";
import { data, redirect } from "react-router";
import { toast } from "sonner";

import { Button, buttonVariants } from "~/components/ui/button";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";

import * as schema from "~/../db/schema";
import {
  AdminPageActions,
  AdminPageContainer,
  AdminPageContent,
  AdminPageFooter,
  AdminPageHeader,
} from "~/components/features/admin-page-layout/admin-page-layout";
import { useAppForm } from "~/components/shared/form";
import { loggerContext } from "~/context/logger-context.server";
import { sessionContext } from "~/context/session-context.server";
import { db } from "~/lib/db";
import { PieceFormSchema, type PieceFormSchemaType } from "~/lib/schemas";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";
import {
  cn,
  convertFormDataToObjectUnsafe,
  generateSlug,
  priceFromGrosz,
  priceToGrosz,
} from "~/lib/utils";

import type { Route } from "./+types/admin-pieces-edit.page";

// ========================== LOADING ==========================

export async function loader({ params, context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const { pieceId } = params;

  console.log("HERE LOGGING HERE");

  const piece = await db.query.pieces.findFirst({
    where: eq(schema.pieces.id, pieceId),
    with: {
      images: {
        orderBy: (images, { asc }) => [asc(images.displayOrder)],
      },
      piecesToTags: {
        with: {
          tag: true,
        },
      },
      measurements: true,
      brand: true,
      size: true,
      category: {
        with: {
          image: true,
        },
      },
    },
  });

  console.log("HERE LOGGING HERE");

  if (!piece) {
    throw data({}, { status: 404 });
  }

  const [
    tags,
    categories,
    brands,
    sizes,
    piecesWithKeywords,
    productsWithKeywords,
  ] = await Promise.all([
    db.query.tags.findMany({}),
    db.query.categories.findMany({
      with: {
        image: true,
      },
    }),
    db.query.brands.findMany({}),
    db.query.sizes.findMany({}),
    db.query.pieces.findMany({
      columns: {
        keywords: true,
      },
    }),
    db.query.products.findMany({
      columns: {
        keywords: true,
      },
    }),
  ]);

  const keywordSuggestions = [
    ...productsWithKeywords
      .map((product) => product.keywords)
      .flat()
      .filter((keyword): keyword is string => keyword !== null),
    ...piecesWithKeywords
      .map((piece) => piece.keywords)
      .flat()
      .filter((keyword): keyword is string => keyword !== null),
  ].filter((keyword): keyword is string => keyword !== null);

  // Transform piece to form default values format
  const defaultValues: PieceFormSchemaType = {
    name: piece.name,
    gender: piece.gender,
    keywords: piece.keywords || [],
    brandId: piece.brandId || "",
    sizeId: piece.sizeId || "",
    categoryId: piece.categoryId || "",
    tagsIds: piece.piecesToTags.map((ptt) => ptt.tagId),
    price: priceFromGrosz(piece.priceInGrosz),
    homeFeaturedOrder: piece.homeFeaturedOrder,
    productDisplayOrder: piece.productDisplayOrder,
    images: piece.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt || "",
      width: img.width,
      height: img.height,
      filename: img.filename || "",
      mimeType: img.mimeType || "",
      filesize: img.filesize || 0,
      displayOrder: img.displayOrder || -1,
    })),
    measurements: piece.measurements.map((m) => ({
      name: m.name,
      value: m.value,
    })),
  };

  return data(
    {
      tags,
      categories,
      brands,
      sizes,
      keywordSuggestions,
      defaultValues,
    },
    { status: 200 }
  );
}

// ========================== ACTIONS ==========================

export async function action({ request, params, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;
  const { pieceId } = params;

  try {
    const args = convertFormDataToObjectUnsafe(
      PieceFormSchema,
      await request.formData()
    );

    const { success, error } = PieceFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Piece validation failed", {
        adminId,
        pieceId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          piece: null,
        },
        { status: 400 }
      );
    }

    const existingSlugs = await db.query.pieces.findMany({
      columns: { slug: true },
      where: ne(schema.pieces.id, pieceId),
    });
    const slugs = existingSlugs.map((piece) => piece.slug);
    const slug = generateSlug(args.name, slugs);

    const updatedPiece = await db.transaction(async (tx) => {
      const updatedPiece = await tx
        .update(schema.pieces)
        .set({
          name: args.name,
          gender: args.gender as "male" | "female" | "unisex",
          slug,
          keywords: args.keywords,
          priceInGrosz: priceToGrosz(args.price),
          brandId: args.brandId,
          sizeId: args.sizeId,
          categoryId: args.categoryId ?? null,
          homeFeaturedOrder: args.homeFeaturedOrder ?? -1,
          productDisplayOrder: args.productDisplayOrder ?? -1,
        })
        .where(eq(schema.pieces.id, pieceId))
        .returning()
        .then((result) => result[0]!);

      // Handle images
      const imagesToCreate = args.images.filter((image) => !image.id);
      const imagesWithIds = args.images.filter((image) => image.id);

      const existingImages = await tx.query.images.findMany({
        where: eq(schema.images.pieceId, pieceId),
      });

      const existingImageIds = existingImages.map((img) => img.id);
      const providedImageIds = imagesWithIds
        .map((img) => img.id)
        .filter((id): id is string => id !== undefined);

      const imagesToDelete = existingImageIds.filter(
        (id) => !providedImageIds.includes(id)
      );

      const imagesToUpdate = imagesWithIds.filter((image) =>
        existingImageIds.includes(image.id!)
      );

      if (imagesToCreate.length > 0) {
        await tx.insert(schema.images).values(
          imagesToCreate.map((image) => ({
            url: image.url,
            width: image.width,
            height: image.height,
            alt: image.alt,
            displayOrder: image.displayOrder,
            filename: image.filename,
            mimeType: image.mimeType,
            filesize: image.filesize,
            pieceId: updatedPiece.id,
          }))
        );
      }

      if (imagesToDelete.length > 0) {
        await tx
          .delete(schema.images)
          .where(inArray(schema.images.id, imagesToDelete));
      }

      if (imagesToUpdate.length > 0) {
        await Promise.all(
          imagesToUpdate.map((image) =>
            tx
              .update(schema.images)
              .set({
                url: image.url,
                width: image.width,
                height: image.height,
                alt: image.alt,
                displayOrder: image.displayOrder,
                filename: image.filename,
                mimeType: image.mimeType,
                filesize: image.filesize,
              })
              .where(eq(schema.images.id, image.id!))
          )
        );
      }

      // Handle measurements
      const measurementsToCreate = args.measurements.filter((m) => !m.id);
      const measurementsWithIds = args.measurements.filter((m) => m.id);

      const existingMeasurements = await tx.query.measurements.findMany({
        where: eq(schema.measurements.pieceId, pieceId),
      });

      const existingMeasurementIds = existingMeasurements.map((m) => m.id);
      const providedMeasurementIds = measurementsWithIds
        .map((m) => m.id)
        .filter((id): id is string => id !== undefined);

      const measurementsToDelete = existingMeasurementIds.filter(
        (id) => !providedMeasurementIds.includes(id)
      );

      const measurementsToUpdate = measurementsWithIds.filter((m) =>
        existingMeasurementIds.includes(m.id!)
      );

      if (measurementsToCreate.length > 0) {
        await tx.insert(schema.measurements).values(
          measurementsToCreate.map((measurement) => ({
            name: measurement.name,
            value: measurement.value,
            unit: measurement.unit ?? undefined,
            pieceId: updatedPiece.id,
          }))
        );
      }

      if (measurementsToDelete.length > 0) {
        await tx
          .delete(schema.measurements)
          .where(inArray(schema.measurements.id, measurementsToDelete));
      }

      if (measurementsToUpdate.length > 0) {
        await Promise.all(
          measurementsToUpdate.map((measurement) =>
            tx
              .update(schema.measurements)
              .set({
                name: measurement.name,
                value: measurement.value,
                unit: measurement.unit ?? undefined,
              })
              .where(eq(schema.measurements.id, measurement.id!))
          )
        );
      }

      // Handle tags - clear old associations, then set new ones
      await tx
        .delete(schema.piecesToTags)
        .where(eq(schema.piecesToTags.pieceId, pieceId));

      if (args.tagsIds.length > 0) {
        await tx.insert(schema.piecesToTags).values(
          args.tagsIds.map((tagId) => ({
            pieceId: updatedPiece.id,
            tagId,
          }))
        );
      }

      return updatedPiece;
    });

    logger.info("Piece updated", {
      adminId,
      pieceId,
      pieceName: updatedPiece?.name,
    });

    return data(
      {
        success: true,
        piece: updatedPiece,
        error: null,
        message: "Ubranie zostało zaktualizowane",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to update piece", { error, adminId, pieceId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        piece: null,
      },
      { status: 500 }
    );
  }
}

export async function clientAction({ serverAction }: Route.ClientActionArgs) {
  const result = await serverAction();

  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.message);
  }

  return result;
}

// ========================== PAGE ==========================

const PIECE_FORM_ID = "piece-form";

export default function AdminPiecesEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { tags, categories, brands, sizes, keywordSuggestions, defaultValues } =
    loaderData;

  const fetcher = useFetcher<typeof action>();

  const isUpdating = fetcher.state === "submitting";

  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues,
    validators: {
      onSubmit: PieceFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(PieceFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate("/admin/ubrania");
    }
  }, [fetcher.data, navigate]);

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={PIECE_FORM_ID} type="reset">
            <RotateCcwIcon />
          </Button>
        </AdminPageActions>
      </AdminPageHeader>
      <AdminPageContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-8"
          id={PIECE_FORM_ID}
        >
          <form.AppField name="name">
            {(field) => <field.TextField label="Nazwa" />}
          </form.AppField>
          <form.AppField name="gender">
            {(field) => (
              <field.SelectField
                label="Płeć"
                options={[
                  { label: "Mężczyzna", value: "male" },
                  { label: "Kobieta", value: "female" },
                  { label: "Unisex", value: "unisex" },
                ]}
              />
            )}
          </form.AppField>
          <form.AppField name="price">
            {(field) => (
              <field.NumberField
                label="Cena"
                description="Cena ubrania w PLN"
                suffix=" PLN"
                decimalScale={2}
                fixedDecimalScale={true}
                min={0}
                stepper={0.01}
                placeholder="0.00"
              />
            )}
          </form.AppField>
          <form.AppField name="brandId">
            {(field) => (
              <field.ComboboxField
                label="Marka"
                options={brands.map((brand) => ({
                  label: brand.name,
                  value: brand.id,
                }))}
              />
            )}
          </form.AppField>
          <form.AppField name="sizeId">
            {(field) => (
              <field.ComboboxField
                label="Rozmiar"
                options={sizes.map((size) => ({
                  label: size.name,
                  value: size.id,
                }))}
              />
            )}
          </form.AppField>
          <form.AppField name="categoryId">
            {(field) => (
              <field.ComboboxField
                label="Kategoria"
                options={categories.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
              />
            )}
          </form.AppField>
          <form.AppField name="keywords">
            {(field) => (
              <field.TagsField
                label="Słowa kluczowe"
                suggestions={keywordSuggestions}
              />
            )}
          </form.AppField>
          <form.AppField name="tagsIds">
            {(field) => (
              <field.MultiComboboxField
                label="Tagi"
                options={tags.map((tag) => ({
                  label: tag.name,
                  value: tag.id,
                }))}
              />
            )}
          </form.AppField>
          <form.AppField name="homeFeaturedOrder">
            {(field) => (
              <field.NumberField
                label="Kolejność wyświetlania na stronie głównej"
                description="Kolejność wyświetlania ubrania (-1 oznacza brak określonej kolejności)"
                min={-1}
                stepper={1}
                placeholder="-1"
              />
            )}
          </form.AppField>
          <form.AppField name="productDisplayOrder">
            {(field) => (
              <field.NumberField
                label="Kolejność wyświetlania na stronie produktu"
                description="Kolejność wyświetlania ubrania (-1 oznacza brak określonej kolejności)"
                min={-1}
                stepper={1}
                placeholder="-1"
              />
            )}
          </form.AppField>
          <form.AppField name="images">
            {(field) => (
              <field.ImagesField
                label="Galeria zdjęć"
                description="Galeria zdjęć ubrania"
                uploadPreset="pieces"
              />
            )}
          </form.AppField>
          <form.Field name="measurements" mode="array">
            {(field) => {
              return (
                <FieldSet>
                  <FieldLegend>Wymiary</FieldLegend>
                  <FieldDescription>Wymiary ubrania</FieldDescription>
                  <FieldSeparator />

                  <FieldGroup className="gap-4">
                    {field.state.value.map((_, index) => (
                      <div key={index} className="flex flex-row gap-2">
                        {/* Name field */}
                        <form.AppField name={`measurements[${index}].name`}>
                          {(field) => (
                            <field.TextField
                              label="Nazwa"
                              description="Nazwa wymiaru"
                            />
                          )}
                        </form.AppField>

                        {/* Value field */}
                        <form.AppField name={`measurements[${index}].value`}>
                          {(field) => (
                            <field.NumberField
                              label="Wartość"
                              description="Wartość wymiaru"
                              suffix=" cm"
                              decimalScale={2}
                              fixedDecimalScale={true}
                            />
                          )}
                        </form.AppField>

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
                        field.handleChange([
                          ...field.state.value,
                          { name: "", value: 0 },
                        ]);
                      }}
                    >
                      <PlusIcon className="h-4 w-4" />
                      Dodaj wymiar
                    </Button>
                  </FieldGroup>
                </FieldSet>
              );
            }}
          </form.Field>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/ubrania"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={PIECE_FORM_ID}
          disabled={isUpdating}
        >
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz ubranie</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}

// ========================== ERRORS ==========================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (
    isRouteErrorResponse(error) &&
    error instanceof Response &&
    error.status === 404
  )
    return (
      // TODO: Add a error component
      <div>
        <h1>Error</h1>
      </div>
    );

  return null;
}
