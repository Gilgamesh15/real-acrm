import { eq, ne, not } from "drizzle-orm";
import { CheckCircleIcon, ChevronLeftIcon, RotateCcwIcon } from "lucide-react";
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
import { CategoryFormSchema, type CategoryFormSchemaType } from "~/lib/schemas";
import { convertObjectToFormDataUnsafe } from "~/lib/utils";
import {
  cn,
  convertFormDataToObjectUnsafe,
  enrichWithPath,
  generateSlug,
} from "~/lib/utils";

import type { Route } from "./+types/admin-categories-edit.page";

// ========================== LOADING ==========================

export async function loader({ params, context }: Route.LoaderArgs) {
  const session = context.get(sessionContext);

  if (!session) {
    throw redirect("/zaloguj-sie?callbackUrl=/admin");
  }

  if (session.user?.role !== "admin") {
    throw redirect("/");
  }

  const { categoryId } = params;

  const category = await db.query.categories.findFirst({
    where: eq(schema.categories.id, categoryId),
    with: {
      image: true,
    },
  });

  if (!category) {
    throw data({}, { status: 404 });
  }

  const remainingCategories = await db.query.categories.findMany({
    where: not(eq(schema.categories.id, categoryId)),
  });

  return data({ category, remainingCategories }, { status: 200 });
}

// ========================== ACTIONS ==========================

export async function action({ request, params, context }: Route.ActionArgs) {
  const logger = context.get(loggerContext);
  const session = context.get(sessionContext);
  const adminId = session?.user?.id;
  const { categoryId } = params;

  try {
    const args = convertFormDataToObjectUnsafe(
      CategoryFormSchema,
      await request.formData()
    );

    const { success, error } = CategoryFormSchema.safeParse(args);
    if (!success) {
      logger.warn("Category validation failed", {
        adminId,
        categoryId,
        errors: error.issues.map((i) => i.message),
      });
      throw data(
        {
          success: false,
          message: "Nieprawidłowe dane wejściowe",
          error: error.issues.map((issue) => issue.message).join(", "),
          category: null,
        },
        { status: 400 }
      );
    }

    const existingCategory = await db.query.categories.findFirst({
      where: eq(schema.categories.id, categoryId),
    });

    if (!existingCategory) {
      throw data(
        {
          success: false,
          message: "Kategoria nie została znaleziona",
          error: "Kategoria nie została znaleziona",
          category: null,
        },
        { status: 404 }
      );
    }

    // Validate parent exists and prevent circular reference
    if (args.parentId) {
      if (args.parentId === categoryId) {
        throw data(
          {
            success: false,
            message: "Kategoria nie może być swoim własnym rodzicem",
            error: "Kategoria nie może być swoim własnym rodzicem",
            category: null,
          },
          { status: 400 }
        );
      }

      const parentCategory = await db.query.categories.findFirst({
        where: eq(schema.categories.id, args.parentId),
      });

      if (!parentCategory) {
        throw data(
          {
            success: false,
            message: "Kategoria nadrzędna nie została znaleziona",
            error: "Kategoria nadrzędna nie została znaleziona",
            category: null,
          },
          { status: 404 }
        );
      }

      let wouldCreateCircle = false;
      let currentId: string | null = args.parentId;

      while (currentId) {
        if (currentId === categoryId) {
          wouldCreateCircle = true;
          break;
        }

        const parent: { parentId: string | null } | undefined =
          await db.query.categories.findFirst({
            where: eq(schema.categories.id, currentId),
            columns: { parentId: true },
          });

        currentId = parent?.parentId ?? null;
      }

      if (wouldCreateCircle) {
        throw data(
          {
            success: false,
            message: "Nie można utworzyć cyklicznego odniesienia",
            error: "Nie można utworzyć cyklicznego odniesienia",
            category: null,
          },
          { status: 400 }
        );
      }
    }

    const existingSlugs = await db.query.categories.findMany({
      columns: { slug: true },
      where: ne(schema.categories.id, categoryId),
    });
    const slugs = existingSlugs.map((cat) => cat.slug);
    const slug = generateSlug(args.name, slugs);

    const [category] = await db.transaction(async (tx) => {
      // Update category
      const [updatedCategory] = await tx
        .update(schema.categories)
        .set({
          name: args.name,
          slug,
          parentId: args.parentId ?? null,
          featuredOrder: args.featuredOrder ?? -1,
        })
        .where(eq(schema.categories.id, categoryId))
        .returning();

      // Handle image update
      if (args.image) {
        if (args.image.id) {
          // Update existing image
          await tx
            .update(schema.images)
            .set({
              url: args.image.url,
              width: args.image.width,
              height: args.image.height,
              alt: args.image.alt,
              filename: args.image.filename,
              mimeType: args.image.mimeType,
              filesize: args.image.filesize,
            })
            .where(eq(schema.images.id, args.image.id));
        } else {
          // Get existing image for this category
          const existingImage = await tx.query.images.findFirst({
            where: eq(schema.images.categoryId, categoryId),
          });

          if (existingImage) {
            // Update existing image
            await tx
              .update(schema.images)
              .set({
                url: args.image.url,
                width: args.image.width,
                height: args.image.height,
                alt: args.image.alt,
                filename: args.image.filename,
                mimeType: args.image.mimeType,
                filesize: args.image.filesize,
              })
              .where(eq(schema.images.id, existingImage.id));
          } else {
            // Create new image
            await tx.insert(schema.images).values({
              url: args.image.url,
              width: args.image.width,
              height: args.image.height,
              alt: args.image.alt,
              filename: args.image.filename,
              mimeType: args.image.mimeType,
              filesize: args.image.filesize,
              categoryId: updatedCategory!.id,
            });
          }
        }
      }

      // Revalidate paths for all categories
      // Fetch all categories
      const categories = await tx.query.categories.findMany({
        columns: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      });

      // Enrich with paths
      const enriched = enrichWithPath(categories);

      // Update each category with its computed path
      await Promise.all(
        enriched.map((category) =>
          tx
            .update(schema.categories)
            .set({ path: category.path })
            .where(eq(schema.categories.id, category.id))
        )
      );

      return [updatedCategory];
    });

    logger.info("Category updated", {
      adminId,
      categoryId,
      categoryName: category?.name,
    });

    return data(
      {
        success: true,
        category,
        error: null,
        message: "Kategoria została zaktualizowana",
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Failed to update category", { error, adminId, categoryId });
    throw data(
      {
        success: false,
        error,
        message: "Wystąpił nieoczekiwany błąd",
        category: null,
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

const CATEGORY_FORM_ID = "category-form";

export default function AdminCategoriesEditPage({
  loaderData,
}: Route.ComponentProps) {
  const { remainingCategories, category } = loaderData;

  const fetcher = useFetcher<typeof action>();

  const isUpdating = fetcher.state === "submitting";

  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      name: category.name,
      parentId: category.parentId ?? undefined,
      image: category.image,
      featuredOrder: category.featuredOrder,
    } as CategoryFormSchemaType,
    validators: {
      onSubmit: CategoryFormSchema,
    },
    onSubmit: async ({ value }) => {
      fetcher.submit(convertObjectToFormDataUnsafe(CategoryFormSchema, value), {
        method: "post",
      });
    },
  });

  React.useEffect(() => {
    if (fetcher.data?.success) {
      navigate(`/admin/kategorie`);
    }
  }, [fetcher.data, navigate]);

  return (
    <AdminPageContainer>
      <AdminPageHeader>
        <AdminPageActions>
          <Button variant="outline" form={CATEGORY_FORM_ID} type="reset">
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
          id={CATEGORY_FORM_ID}
        >
          <FieldSet>
            <FieldLegend>Informacje o kategorii</FieldLegend>
            <FieldGroup>
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Nazwa"
                    description="Nazwa kategorii wyświetlana dla klientów"
                  />
                )}
              </form.AppField>

              <FieldSeparator>Struktura hierarchiczna</FieldSeparator>

              <form.AppField name="parentId">
                {(field) => (
                  <field.ComboboxField
                    label="Kategoria nadrzędna"
                    description="Wybierz kategorię nadrzędną aby utworzyć hierarchię. Pozostaw puste dla kategorii głównej"
                    placeholder="Wybierz kategorię nadrzędną"
                    searchPlaceholder="Wyszukaj kategorię"
                    emptyStateMessage="Brak dostępnych kategorii"
                    options={remainingCategories.map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))}
                  />
                )}
              </form.AppField>

              <FieldSeparator>Pozycjonowanie</FieldSeparator>

              <form.AppField name="featuredOrder">
                {(field) => (
                  <field.NumberField
                    label="Kolejność wyróżnienia"
                    description="Ustaw kolejność wyświetlania kategorii w sekcji wyróżnionych. -1 oznacza brak wyróżnienia."
                    placeholder="-1"
                  />
                )}
              </form.AppField>

              <FieldSeparator>Grafika kategorii</FieldSeparator>

              <form.AppField name="image">
                {(field) => (
                  <field.ImageField
                    label="Obraz kategorii"
                    description="Główne zdjęcie kategorii wyświetlane w galerii i na stronie kategorii. Zalecany rozmiar: 1200x800px"
                    uploadPreset="categories"
                  />
                )}
              </form.AppField>
            </FieldGroup>
          </FieldSet>
        </form>
      </AdminPageContent>

      <AdminPageFooter>
        <Link
          to="/admin/kategorie"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <ChevronLeftIcon />
          Powrót
        </Link>

        <Button
          size="sm"
          type="submit"
          form={CATEGORY_FORM_ID}
          disabled={isUpdating}
        >
          {isUpdating ? <Spinner /> : <CheckCircleIcon />}
          <span>Zapisz kategorię</span>
        </Button>
      </AdminPageFooter>
    </AdminPageContainer>
  );
}

// ========================== ERRORS ==========================

export function ErrorBoundary({ error }: { error: Error }) {
  if (
    isRouteErrorResponse(error) &&
    error instanceof Response &&
    error.status === 404
  )
    return (
      // TODO: Add a error component
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
      </div>
    );

  return null;
}
