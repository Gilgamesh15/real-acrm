import { and, inArray, isNull } from "drizzle-orm";
import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
import React from "react";
import { Link, useFetcher, useNavigate } from "react-router";
import { data, redirect } from "react-router";
import { toast } from "sonner";

import { Button, buttonVariants } from "~/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "~/components/ui/field";
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
import { ProductFormSchema, type ProductFormSchemaType } from "~/lib/schemas";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";
import { cn, convertFormDataToObjectUnsafe, generateSlug } from "~/lib/utils";

import type { Route } from "./+types/admin-products-create.page";

// ========================== LOADING ==========================

export async function loader({ context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const [pieces, piecesWithKeywords, productsWithKeywords] = await Promise.all([
    db.query.pieces.findMany({
      where: and(
        isNull(schema.pieces.productId),
        inArray(schema.pieces.status, ["draft", "published"])
      ),
    }),
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
      pieces,
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
      ProductFormSchema,
      await request.formData()
    );

    const { success, error } = ProductFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Product validation failed", {
        adminId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          product: null,
        },
        { status: 400 }
      );
    }

    const existingSlugs = await db.query.products.findMany({
      columns: { slug: true },
    });
    const slugs = existingSlugs.map((product) => product.slug);
    const slug = generateSlug(args.name, slugs);

    const createdProduct = await db.transaction(async (tx) => {
      const [createdProduct] = await tx
        .insert(schema.products)
        .values({
          name: args.name,
          slug,
          keywords: args.keywords,
          description: args.description,
          homeFeaturedOrder: args.homeFeaturedOrder ?? -1,
        })
        .returning();

      if (args.images.length > 0) {
        await tx.insert(schema.images).values(
          args.images.map((image) => ({
            url: image.url,
            width: image.width,
            height: image.height,
            alt: image.alt,
            displayOrder: image.displayOrder,
            productId: createdProduct!.id,
            filename: image.filename,
            mimeType: image.mimeType,
            filesize: image.filesize,
          }))
        );
      }

      if (args.piecesIds.length > 0) {
        await tx
          .update(schema.pieces)
          .set({ productId: createdProduct!.id })
          .where(inArray(schema.pieces.id, args.piecesIds));
      }

      return createdProduct;
    });

    logger.info("Product created", {
      adminId,
      productId: createdProduct?.id,
      productName: createdProduct?.name,
    });

    return data(
      {
        success: true,
        product: createdProduct,
        error: null,
        message: "Produkt został utworzony",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to create product", { error, adminId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        product: null,
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

const PRODUCT_FORM_ID = "product-form";

export default function AdminProductsCreatePage({
  loaderData,
}: Route.ComponentProps) {
  const { pieces, keywordSuggestions } = loaderData;

  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: "",
      keywords: [],
      description: {
        type: "doc",
        content: [],
      },
      images: [],
      piecesIds: [],
      homeFeaturedOrder: -1,
    } as ProductFormSchemaType,
    validators: {
      onSubmit: ProductFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(ProductFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/admin/products`);
    }
  }, [fetcher.data, navigate]);

  const isCreating = fetcher.state === "submitting";

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={PRODUCT_FORM_ID} type="reset">
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
          id={PRODUCT_FORM_ID}
          className="space-y-8"
        >
          <FieldSet>
            <FieldLegend>Podstawowe informacje</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa produktu"
                    description="Główna nazwa produktu wyświetlana w sklepie i wyszukiwarce"
                  />
                )}
              </form.AppField>
              <form.AppField name="keywords">
                {(field) => (
                  <field.TagsField
                    label="Słowa kluczowe"
                    description="Tagi ułatwiające wyszukiwanie produktu przez klientów"
                    suggestions={keywordSuggestions}
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Opis produktu</FieldLegend>
            <FieldGroup>
              <form.AppField name="description">
                {(field) => (
                  <field.RichTextField
                    label="Szczegółowy opis"
                    description="Pełny opis produktu z możliwością formatowania tekstu"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Galeria zdjęć</FieldLegend>
            <FieldGroup>
              <form.AppField name="images">
                {(field) => (
                  <field.ImagesField
                    label="Zdjęcia produktu"
                    description="Dodaj zdjęcia produktu. Pierwsze zdjęcie będzie głównym obrazem produktu"
                    uploadPreset="products"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend>Elementy produktu</FieldLegend>
            <FieldGroup>
              <form.AppField name="piecesIds">
                {(field) => (
                  <field.MultiComboboxField
                    label="Przypisane elementy"
                    description="Wybierz elementy (pieces), które składają się na ten produkt"
                    placeholder="Wybierz elementy produktu"
                    searchPlaceholder="Wyszukaj elementy"
                    emptyStateMessage="Brak dostępnych elementów"
                    options={pieces.map((piece) => ({
                      label: piece.name,
                      value: piece.id,
                    }))}
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
          <form.AppField name="homeFeaturedOrder">
            {(field) => (
              <field.NumberField
                label="Kolejność wyświetlania na stronie głównej"
                description="Kolejność wyświetlania produktu na stronie głównej"
                min={-1}
                stepper={1}
                placeholder="-1"
              />
            )}
          </form.AppField>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/products"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={PRODUCT_FORM_ID}
          disabled={isCreating}
        >
          {isCreating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz produkt</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}
