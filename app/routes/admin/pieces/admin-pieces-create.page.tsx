import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
import { PlusIcon, XIcon } from "lucide-react";
import React from "react";
import { Link, useFetcher, useNavigate } from "react-router";
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
  priceToGrosz,
} from "~/lib/utils";

import type { Route } from "./+types/admin-pieces-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
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

  return data(
    {
      tags,
      categories,
      brands,
      sizes,
      keywordSuggestions: [
        ...productsWithKeywords
          .map((product) => product.keywords)
          .flat()
          .filter((keyword): keyword is string => keyword !== null),
        ...piecesWithKeywords
          .map((piece) => piece.keywords)
          .flat()
          .filter((keyword): keyword is string => keyword !== null),
      ].filter((keyword): keyword is string => keyword !== null),
    },
    { status: 200 }
  );
}

// ========================== ACTIONS ==========================

export async function action({ request, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;

  try {
    const args = convertFormDataToObjectUnsafe(
      PieceFormSchema,
      await request.formData()
    );

    const { success, error } = PieceFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Piece validation failed", {
        adminId,
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
    });
    const slugs = existingSlugs.map((piece) => piece.slug);
    const slug = generateSlug(args.name, slugs);

    const createdPiece = await db.transaction(async (tx) => {
      const [createdPiece] = await tx
        .insert(schema.pieces)
        .values({
          gender: args.gender as "female" | "male" | "unisex",
          name: args.name,
          slug,
          keywords: args.keywords,
          priceInGrosz: priceToGrosz(args.price),
          brandId: args.brandId,
          sizeId: args.sizeId,
          categoryId: args.categoryId ?? null,
          homeFeaturedOrder: args.homeFeaturedOrder ?? -1,
          productDisplayOrder: args.productDisplayOrder ?? -1,
        })
        .returning();

      // Create images
      if (args.images.length > 0) {
        await tx.insert(schema.images).values(
          args.images.map((image) => ({
            url: image.url,
            width: image.width,
            height: image.height,
            alt: image.alt,
            displayOrder: image.displayOrder,
            filename: image.filename,
            mimeType: image.mimeType,
            filesize: image.filesize,
            pieceId: createdPiece!.id,
          }))
        );
      }

      // Create measurements
      if (args.measurements.length > 0) {
        await tx.insert(schema.measurements).values(
          args.measurements.map((measurement) => ({
            name: measurement.name,
            value: measurement.value,
            unit: measurement.unit ?? undefined,
            pieceId: createdPiece!.id,
          }))
        );
      }

      // Associate tags (assuming many-to-many through junction table)
      if (args.tagsIds.length > 0) {
        await tx.insert(schema.piecesToTags).values(
          args.tagsIds.map((tagId) => ({
            pieceId: createdPiece!.id,
            tagId,
          }))
        );
      }

      return createdPiece;
    });

    logger.info("Piece created", {
      adminId,
      pieceId: createdPiece?.id,
      pieceName: createdPiece?.name,
    });

    return data(
      {
        success: true,
        piece: createdPiece,
        error: null,
        message: "Ubranie zostało utworzone",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create piece", { error, adminId });
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

export default function AdminPiecesCreatePage({
  loaderData,
}: Route.ComponentProps) {
  const { tags, categories, brands, sizes, keywordSuggestions } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      keywords: [],
      price: 0,
      brandId: "",
      sizeId: "",
      categoryId: "",
      images: [],
      measurements: [],
      tagsIds: [],
      gender: "unisex",
      productDisplayOrder: -1,
      homeFeaturedOrder: -1,
    } as PieceFormSchemaType,
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
      navigate(`/admin/ubrania`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

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
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz ubranie</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
